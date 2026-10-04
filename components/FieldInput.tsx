'use client';
import { useEffect, useRef, useState } from 'react';
import type { Field, FieldValue } from '@/lib/endpoint';

function Webcam({ onShot }: { onShot: (f: File) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const [err, setErr] = useState('');
  const stop = () => {
    (video.current?.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
    if (video.current) video.current.srcObject = null;
    setOn(false);
  };
  useEffect(() => () => {
    const v = video.current;
    (v?.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
  }, []);
  const start = async () => {
    let s: MediaStream | undefined;
    try {
      s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (video.current) { video.current.srcObject = s; await video.current.play(); }
      setOn(true); setErr('');
    } catch (e) { s?.getTracks().forEach((t) => t.stop()); setErr((e as Error).message); }
  };
  const shoot = () => {
    const v = video.current; if (!v) return;
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    c.toBlob((b) => b && onShot(new File([b], 'webcam.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.92);
    stop();
  };
  return (
    <span className="inline-flex items-center gap-1">
      <video ref={video} className={on ? 'h-24 rounded' : 'hidden'} muted playsInline />
      <button type="button" className="rounded border px-2 text-xs" onClick={on ? shoot : start}>{on ? 'Capture' : 'Webcam'}</button>
      {on && <button type="button" className="rounded border px-2 text-xs" onClick={stop}>Cancel</button>}
      {err && <span className="text-xs text-red-700">{err}</span>}
    </span>
  );
}

export function FieldInput({ field, value, onChange }: { field: Field; value: FieldValue; onChange: (v: FieldValue) => void }) {
  const base = 'w-full rounded border px-2 py-1 text-sm font-mono';
  switch (field.kind) {
    case 'bool':
      return <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />;
    case 'number':
      return <input className={base} type="number" value={value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value)} />;
    case 'json':
      return <textarea className={`${base} h-24`} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />;
    case 'select':
      return <select className={base} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>{field.options?.map((o) => <option key={o} value={o}>{o || '—'}</option>)}</select>;
    case 'file':
      return (
        <span className="flex flex-wrap items-center gap-2">
          <input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} className="text-xs" />
          <Webcam onShot={onChange} />
          {value instanceof File && <span className="text-xs text-zinc-500">{value.name} · {Math.round(value.size / 1024)} KB</span>}
        </span>
      );
    case 'files':
      return <input type="file" accept="image/*" multiple onChange={(e) => onChange(Array.from(e.target.files ?? []))} className="text-xs" />;
    default:
      return <input className={base} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />;
  }
}
