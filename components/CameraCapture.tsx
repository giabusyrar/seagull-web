'use client';
import { useEffect, useRef, useState } from 'react';

/** Webcam snapshot as a JPEG File. No face-quality check; the backend judges the photo. */
export function CameraCapture({ onShot }: { onShot: (f: File) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const [err, setErr] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (video.current) video.current.srcObject = null;
    setOn(false);
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);
  const start = async () => {
    let s: MediaStream | undefined;
    try {
      s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (!mounted.current) { s.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = s;
      if (video.current) { video.current.srcObject = s; await video.current.play(); }
      setOn(true); setErr('');
    } catch (e) {
      s?.getTracks().forEach((t) => t.stop()); streamRef.current = null;
      if (mounted.current) setErr((e as Error).message);
    }
  };
  const shoot = () => {
    const v = video.current; if (!v) return;
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    c.toBlob((b) => b && onShot(new File([b], 'kamera.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.92);
    stop();
  };
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <video ref={video} className={on ? 'h-32 rounded' : 'hidden'} muted playsInline />
      <button type="button" className="rounded border border-zinc-300 px-2 py-0.5 text-xs hover:bg-zinc-100" onClick={on ? shoot : start}>{on ? 'Ambil foto' : 'Kamera'}</button>
      {on && <button type="button" className="rounded border border-zinc-300 px-2 py-0.5 text-xs hover:bg-zinc-100" onClick={stop}>Batal</button>}
      {err && <span className="text-xs text-red-700">{err}</span>}
    </span>
  );
}
