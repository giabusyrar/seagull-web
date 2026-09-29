'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, ImageUp, RefreshCw } from 'lucide-react';
import { Button } from '@gateway-experience/shared';

const JPEG_QUALITY = 0.92;

interface CameraCaptureProps {
  onPhoto: (file: File) => void;
}

/**
 * Take a still photo with the device camera (mirrored like a mirror, as the
 * preview) or upload one. Live try-on on video is a later phase; this only
 * captures the photo the analysis and try-on run on.
 */
export function CameraCapture({ onPhoto }: CameraCaptureProps) {
  const video = useRef<HTMLVideoElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const stop = useCallback(() => {
    setStream((s) => {
      s?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    if (video.current && stream) {
      video.current.srcObject = stream;
      video.current.play().catch(() => undefined);
    }
  }, [stream]);

  const start = async () => {
    setCamError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError('Kamera tidak tersedia di browser ini. Unggah foto saja.');
      return;
    }
    setStarting(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      setStream(s);
    } catch {
      setCamError('Kamera tidak bisa dibuka. Izinkan akses kamera, atau unggah foto saja.');
    } finally {
      setStarting(false);
    }
  };

  const capture = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob(
      (b) => {
        if (!b) return;
        stop();
        onPhoto(new File([b], 'kamera.jpg', { type: 'image/jpeg' }));
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-muted border border-border">
        {stream ? (
          <video ref={video} playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="p-3 rounded-full bg-background border border-border text-muted-foreground">
              <Camera className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Ambil foto wajah</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Hadap lurus ke kamera, cahaya rata dari depan, tanpa filter dan tanpa makeup tebal. Bila bisa, pakai atasan atau
                penutup kepala berwarna putih, abu-abu, atau hitam.
              </p>
            </div>
          </div>
        )}
        {stream && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[62%] aspect-[3/4] rounded-[50%] border-2 border-dashed border-background/80" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {stream ? (
          <>
            <Button size="lg" className="flex-1" leftIcon={<Camera className="h-4 w-4" />} onClick={capture}>
              Ambil foto
            </Button>
            <Button size="lg" variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={stop}>
              Tutup kamera
            </Button>
          </>
        ) : (
          <Button size="lg" className="flex-1" isLoading={starting} leftIcon={<Camera className="h-4 w-4" />} onClick={start}>
            Buka kamera
          </Button>
        )}
        <Button size="lg" variant="outline" className="flex-1" leftIcon={<ImageUp className="h-4 w-4" />} onClick={() => upload.current?.click()}>
          Unggah foto
        </Button>
        <input
          ref={upload}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) {
              stop();
              onPhoto(f);
            }
          }}
        />
      </div>
      {camError && <p className="text-xs text-destructive">{camError}</p>}
    </div>
  );
}
