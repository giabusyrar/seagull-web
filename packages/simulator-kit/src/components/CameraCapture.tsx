'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { btnPrimarySm, btnSecondary } from './ui';
import { useLang } from '../lib/i18n';
import { CheckChips, CheckMessage, FaceGuide, FaceMesh } from '../capture/CaptureOverlay';
import { LightingMeters } from '../capture/LightingMeters';
import { drawVisibleFrame, useCaptureCheck } from '../capture/useCaptureCheck';

/** JPEG quality of a camera photo. */
const JPEG_QUALITY = 0.92;
/** The camera box keeps a 3:4 portrait shape; the check and the photo use the part it shows. */
const CAMERA_BOX = 'relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-xl bg-black';

/**
 * Takes a photo with the device camera. With `check`, the colour engine's
 * quality check runs on the video (light, face position, facing the camera,
 * neutral expression; see capture/ and docs/CAPTURE-CHECK.md) and the photo
 * can be taken once it passes. Use it for the front photo only: side photos
 * are turned on purpose, and a UV photo is lit by UV. Without `check`, or when
 * the check cannot load, the camera takes any frame and the backend judges it.
 */
export function CameraCapture({ onShot, primary, check = false }: { onShot: (f: File) => void; primary?: boolean; check?: boolean }) {
  const { t } = useLang();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [err, setErr] = useState('');
  const mounted = useRef(true);

  const stop = useCallback(() => {
    setStream((s) => {
      s?.getTracks().forEach((tr) => tr.stop());
      return null;
    });
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  // Release the camera when the component goes away.
  useEffect(() => () => stream?.getTracks().forEach((tr) => tr.stop()), [stream]);

  const start = async () => {
    setErr('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setErr(t('No camera in this browser. Upload a photo instead.', 'Kamera tidak tersedia di browser ini. Unggah foto saja.'));
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: check ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } } : true, audio: false });
      if (!mounted.current) { s.getTracks().forEach((tr) => tr.stop()); return; }
      setStream(s);
    } catch (e) {
      if (mounted.current) setErr((e as Error).message);
    }
  };

  if (stream) {
    const done = (f: File) => { stop(); onShot(f); };
    return check
      ? <CheckedCamera stream={stream} onShot={done} onClose={stop} />
      : <PlainCamera stream={stream} onShot={done} onClose={stop} />;
  }
  return (
    <span className="inline-flex flex-col items-center gap-2">
      <button type="button" className={primary ? btnPrimarySm : btnSecondary} onClick={start}>{t('Camera', 'Kamera')}</button>
      {err && <span className="max-w-xs text-center text-xs text-red-700">{err}</span>}
    </span>
  );
}

/** Plays `stream` in `video`. */
function useStream(stream: MediaStream) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.srcObject = stream;
    v.play().catch(() => undefined);
    return () => { v.srcObject = null; };
  }, [stream]);
  return video;
}

/** Encodes a canvas as the JPEG the backend gets; `mirror` flips it like the preview. */
function toJpeg(src: HTMLCanvasElement, mirror: boolean, done: (f: File | null) => void) {
  const out = document.createElement('canvas');
  const ctx = out.getContext('2d');
  if (!ctx) return done(null);
  out.width = src.width;
  out.height = src.height;
  if (mirror) { ctx.translate(out.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(src, 0, 0);
  out.toBlob((b) => done(b ? new File([b], 'kamera.jpg', { type: 'image/jpeg' }) : null), 'image/jpeg', JPEG_QUALITY);
}

/** The camera without a check: any frame is taken. */
function PlainCamera({ stream, onShot, onClose }: { stream: MediaStream; onShot(f: File): void; onClose(): void }) {
  const { t } = useLang();
  const video = useStream(stream);
  const shoot = () => {
    const v = video.current;
    if (!v) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    toJpeg(c, false, (f) => f && onShot(f));
  };
  return (
    <span className="inline-flex w-full flex-col items-center gap-2">
      <video ref={video} className="w-full max-w-xs rounded-xl bg-black" muted playsInline />
      <span className="inline-flex gap-1.5">
        <button type="button" className={btnPrimarySm} onClick={shoot}>{t('Take photo', 'Ambil foto')}</button>
        <button type="button" className={btnSecondary} onClick={onClose}>{t('Cancel', 'Batal')}</button>
      </span>
    </span>
  );
}

/**
 * The checked camera: the mirrored video, the live check over it, the capture
 * buttons and the light meters. The photo is the frame the check passed (the
 * part of the frame the box shows), mirrored like the preview.
 */
function CheckedCamera({ stream, onShot, onClose }: { stream: MediaStream; onShot(f: File): void; onClose(): void }) {
  const { t } = useLang();
  const video = useStream(stream);
  const check = useCaptureCheck(video);
  const [taking, setTaking] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // `frame` is the frame the check just passed (called from its frame loop), or null: grab the visible frame now.
  const takePhoto = useCallback((frame: HTMLCanvasElement | null) => {
    let src = frame;
    if (!src && video.current) {
      src = document.createElement('canvas');
      if (!drawVisibleFrame(video.current, src)) src = null;
    }
    if (!src) { setTaking(false); return; }
    toJpeg(src, true, (f) => {
      if (!mounted.current) return; // the camera was closed meanwhile
      if (f) onShot(f);
      else setTaking(false);
    });
  }, [onShot, video]);

  const take = () => { setTaking(true); check.capture(takePhoto); };
  // Without a running check (it failed to load or is not configured) the camera takes any frame.
  const canTake = check.status === 'unavailable' || check.ready;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className={CAMERA_BOX}>
        <video ref={video} playsInline muted className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />
        <FaceMesh face={check.face} mesh={check.mesh} className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100 text-white/30" />
        <FaceGuide ready={check.ready} />
        <CheckChips check={check} />
        <CheckMessage check={check} />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span className="inline-flex gap-1.5">
          <button type="button" className={btnPrimarySm} disabled={!canTake || taking} onClick={take}>{taking ? t('Taking…', 'Mengambil…') : t('Take photo', 'Ambil foto')}</button>
          <button type="button" className={btnSecondary} onClick={onClose}>{t('Cancel', 'Batal')}</button>
        </span>
        {!canTake && !taking && (
          <button type="button" onClick={take} className="text-xs font-semibold text-zinc-500 underline underline-offset-2 hover:text-zinc-900">
            {t('Take without the check', 'Ambil foto tanpa cek')}
          </button>
        )}
      </div>
      {check.status !== 'unavailable' && <LightingMeters metrics={check.metrics} failed={check.failed} />}
    </div>
  );
}
