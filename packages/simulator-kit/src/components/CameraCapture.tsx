'use client';
import { useEffect, useRef, useState } from 'react';
import { btnPrimarySm, btnSecondary } from './ui';
import { useLang } from '@/lib/i18n';

/** Webcam snapshot as a JPEG File. No face-quality check; the backend judges the photo. */
export function CameraCapture({ onShot, primary }: { onShot: (f: File) => void; primary?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const { t } = useLang();
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
    <span className={`inline-flex flex-col items-center gap-2 ${on ? 'w-full' : ''}`}>
      <video ref={video} className={on ? 'w-full max-w-xs rounded-xl bg-black' : 'hidden'} muted playsInline />
      <span className="inline-flex gap-1.5">
        <button type="button" className={primary || on ? btnPrimarySm : btnSecondary} onClick={on ? shoot : start}>{on ? t('Take photo', 'Ambil foto') : t('Camera', 'Kamera')}</button>
        {on && <button type="button" className={btnSecondary} onClick={stop}>{t('Cancel', 'Batal')}</button>}
      </span>
      {err && <span className="max-w-xs text-center text-xs text-red-700">{err}</span>}
    </span>
  );
}
