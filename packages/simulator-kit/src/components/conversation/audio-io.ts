'use client';
import { base64ToPcm16, bytesToBase64, floatToPcm16, MIC_SAMPLE_RATE, pcm16ToFloat, rateOf } from '../../lib/audio';

// Collects raw microphone frames on the audio thread and posts them to the page.
const WORKLET = `
class Tap extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) this.port.postMessage(ch.slice(0));
    return true;
  }
}
registerProcessor('sim-mic-tap', Tap);
`;

/** ~100 ms of 16 kHz PCM16 per message: small enough for the engine's 128 KB limit, few enough messages. */
const CHUNK_SAMPLES = MIC_SAMPLE_RATE / 10;

/** Microphone → base64 PCM16 chunks at the engine's rate. */
export class MicStream {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;
  private pending: Int16Array[] = [];
  private pendingLen = 0;

  constructor(private onChunk: (b64: string) => void, private onLevel?: (level: number) => void) {}

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    this.ctx = new AudioContext();
    const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
    try {
      await this.ctx.audioWorklet.addModule(url);
    } finally {
      URL.revokeObjectURL(url);
    }
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.node = new AudioWorkletNode(this.ctx, 'sim-mic-tap');
    this.node.port.onmessage = (e: MessageEvent<Float32Array>) => this.push(e.data);
    src.connect(this.node);
  }

  private push(frame: Float32Array) {
    if (!this.ctx) return;
    if (this.onLevel) {
      let peak = 0;
      for (let i = 0; i < frame.length; i++) peak = Math.max(peak, Math.abs(frame[i]));
      this.onLevel(peak);
    }
    const pcm = floatToPcm16(frame, this.ctx.sampleRate);
    this.pending.push(pcm);
    this.pendingLen += pcm.length;
    if (this.pendingLen >= CHUNK_SAMPLES) this.flush();
  }

  private flush() {
    if (!this.pendingLen) return;
    const all = new Int16Array(this.pendingLen);
    let o = 0;
    for (const p of this.pending) { all.set(p, o); o += p.length; }
    this.pending = [];
    this.pendingLen = 0;
    this.onChunk(bytesToBase64(new Uint8Array(all.buffer)));
  }

  stop() {
    this.flush();
    this.node?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close();
    this.ctx = null; this.stream = null; this.node = null;
  }
}

/** Plays the advisor's PCM16 replies back to back; `interrupt` drops whatever is queued. */
export class Player {
  private ctx: AudioContext | null = null;
  private next = 0;
  private sources = new Set<AudioBufferSourceNode>();

  constructor(private onSpeaking?: (speaking: boolean) => void) {}

  /** Returns an error message when the chunk cannot be played (no rate in its type), else null. */
  play(b64: string, mime: string | undefined): string | null {
    const rate = rateOf(mime);
    if (!rate) return `Audio without a sample rate (${mime || 'no MIME type'}); not played.`;
    if (!this.ctx) this.ctx = new AudioContext();
    const samples = pcm16ToFloat(base64ToPcm16(b64));
    if (!samples.length) return null;
    const buf = this.ctx.createBuffer(1, samples.length, rate);
    buf.copyToChannel(samples, 0);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.ctx.destination);
    const at = Math.max(this.ctx.currentTime, this.next);
    src.start(at);
    this.next = at + buf.duration;
    this.sources.add(src);
    this.onSpeaking?.(true);
    src.onended = () => {
      this.sources.delete(src);
      if (this.sources.size === 0) this.onSpeaking?.(false);
    };
    return null;
  }

  interrupt() {
    for (const s of this.sources) { s.onended = null; try { s.stop(); } catch {} }
    this.sources.clear();
    this.next = 0;
    this.onSpeaking?.(false);
  }

  close() {
    this.interrupt();
    void this.ctx?.close();
    this.ctx = null;
  }
}
