'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, ImageUp, RefreshCw } from 'lucide-react';
import { Button } from '@gateway-experience/shared';
import { useTabVisible } from '@/lib/hooks/use-tab-visibility';
import { CheckChips, CheckMessage, FaceGuide, FaceMesh } from './capture/CaptureOverlay';
import { LightingMeters } from './capture/LightingMeters';
import { drawVisibleFrame, useCaptureCheck } from './capture/useCaptureCheck';

const JPEG_QUALITY = 0.92;

// The camera box keeps a 3:4 portrait shape and, on short screens, shrinks so
// the box and the buttons under it fit without scrolling while the face is held
// still (16rem is roughly the page header, card padding and buttons).
const CAMERA_BOX = 'relative mx-auto w-full max-w-[calc((100dvh_-_16rem)*0.75)] aspect-[3/4] rounded-2xl overflow-hidden bg-muted border border-border';

interface CameraCaptureProps {
  onPhoto: (file: File) => void;
}

/**
 * Take a still photo with the device camera (mirrored like a mirror, as the
 * preview) or upload one. While the camera is on, the engine's quality check
 * runs on the video (light, face position, facing the camera, neutral
 * expression; see capture/) and the photo can be taken once it passes. Live
 * try-on on video is a later phase; this only captures the photo the
 * analysis and try-on run on.
 */
export function CameraCapture({ onPhoto }: CameraCaptureProps) {
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

  // The workbench keeps a hidden tab mounted; don't leave the camera on
  // behind it.
  const tabVisible = useTabVisible();
  useEffect(() => {
    // Releasing an external device (the camera stream) is what this effect
    // is for; the state update just mirrors it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!tabVisible) stop();
  }, [tabVisible, stop]);

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

  const uploadButton = (
    <Button size="lg" variant="outline" className="flex-1" leftIcon={<ImageUp className="h-4 w-4" />} onClick={() => upload.current?.click()}>
      Unggah foto
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      {stream ? (
        <LiveCamera
          stream={stream}
          onClose={stop}
          onPhoto={(file) => {
            stop();
            onPhoto(file);
          }}
          extraAction={uploadButton}
        />
      ) : (
        <>
          <div className={CAMERA_BOX}>
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
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="lg" className="flex-1" isLoading={starting} leftIcon={<Camera className="h-4 w-4" />} onClick={start}>
              Buka kamera
            </Button>
            {uploadButton}
          </div>
        </>
      )}
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
      {camError && <p className="text-xs text-destructive">{camError}</p>}
    </div>
  );
}

interface LiveCameraProps {
  stream: MediaStream;
  onPhoto: (file: File) => void;
  onClose: () => void;
  extraAction: React.ReactNode;
}

/**
 * The open camera: video, the live check over it, the capture buttons and the
 * light meters. The photo is the part of the frame the box shows.
 */
function LiveCamera({ stream, onPhoto, onClose, extraAction }: LiveCameraProps) {
  const video = useRef<HTMLVideoElement>(null);
  const check = useCaptureCheck(video);
  const [taking, setTaking] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.srcObject = stream;
    v.play().catch(() => undefined);
  }, [stream]);

  // Saves `frame`, the frame the check just passed (called inside its frame
  // loop), or grabs the visible frame now when there is none. Mirrored like
  // the preview.
  const takePhoto = useCallback(
    (frame: HTMLCanvasElement | null) => {
      let src = frame;
      if (!src && video.current) {
        src = document.createElement('canvas');
        if (!drawVisibleFrame(video.current, src)) src = null;
      }
      const out = document.createElement('canvas');
      const ctx = out.getContext('2d');
      if (!src || !ctx) {
        setTaking(false);
        return;
      }
      out.width = src.width;
      out.height = src.height;
      ctx.translate(out.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(src, 0, 0);
      out.toBlob(
        (b) => {
          if (!mounted.current) return; // the camera was closed meanwhile
          if (b) onPhoto(new File([b], 'kamera.jpg', { type: 'image/jpeg' }));
          else setTaking(false);
        },
        'image/jpeg',
        JPEG_QUALITY,
      );
    },
    [onPhoto],
  );

  const take = () => {
    setTaking(true);
    check.capture(takePhoto);
  };

  // Without a running check (it failed to load) the camera works as before.
  const canTake = check.status === 'unavailable' || check.ready;

  return (
    <>
      <div className={CAMERA_BOX}>
        <video ref={video} playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
        <FaceMesh face={check.face} mesh={check.mesh} className="pointer-events-none absolute inset-0 w-full h-full -scale-x-100 text-white/30" />
        <FaceGuide ready={check.ready} />
        <CheckChips check={check} />
        <CheckMessage check={check} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button size="lg" className="flex-1" isLoading={taking} disabled={!canTake} leftIcon={<Camera className="h-4 w-4" />} onClick={take}>
            Ambil foto
          </Button>
          <Button size="lg" variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={onClose}>
            Tutup kamera
          </Button>
          {extraAction}
        </div>
        {!canTake && !taking && (
          <button
            type="button"
            onClick={take}
            className="self-center cursor-pointer text-xs font-semibold text-muted-foreground underline underline-offset-2 transition hover:text-foreground"
          >
            Ambil foto tanpa cek
          </button>
        )}
      </div>

      {check.status !== 'unavailable' && <LightingMeters metrics={check.metrics} failed={check.failed} />}
    </>
  );
}
