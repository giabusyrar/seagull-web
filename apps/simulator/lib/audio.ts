// PCM16 conversions for the live conversation. The engine takes 16 kHz mono
// PCM16 from the microphone (live_bridge: "audio/pcm;rate=16000") and sends
// PCM16 back with its rate in the MIME type.

/** The rate the engine expects microphone audio at. Fixed by its protocol, not a setting. */
export const MIC_SAMPLE_RATE = 16000;

/** Downsamples by averaging each output sample's source window, then clamps to PCM16. */
export function floatToPcm16(input: Float32Array, inputRate: number, outputRate = MIC_SAMPLE_RATE): Int16Array {
  const ratio = inputRate / outputRate;
  const length = Math.floor(input.length / ratio);
  const out = new Int16Array(length);
  for (let i = 0; i < length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.max(start + 1, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end && j < input.length; j++) sum += input[j];
    const v = Math.max(-1, Math.min(1, sum / (end - start)));
    out[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
  }
  return out;
}

export function pcm16ToFloat(pcm: Int16Array): Float32Array<ArrayBuffer> {
  const out = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) out[i] = pcm[i] / (pcm[i] < 0 ? 0x8000 : 0x7fff);
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Little-endian PCM16 from base64, as the engine sends it. An odd trailing byte is dropped. */
export function base64ToPcm16(b64: string): Int16Array {
  const bin = atob(b64);
  const n = bin.length >> 1;
  const out = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8);
    out[i] = v >= 0x8000 ? v - 0x10000 : v;
  }
  return out;
}

/** "audio/pcm;rate=24000" → 24000. Null when the type names no rate: the caller must not guess one. */
export function rateOf(mime: string | undefined): number | null {
  const m = /rate=(\d+)/.exec(mime ?? '');
  return m ? Number(m[1]) : null;
}
