'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Shade, ShadeAsset } from './ShadeAssetTypes';
import { resolveDynamicEndpoint } from '../../../../core/collection-resolver';
import { buildRegionPaths, REGION_TINT_ALPHA, type FaceLandmark } from './faceRegions';

interface LiveTryOnCanvasProps {
  selectedShade: Shade | null;
}

export const LiveTryOnCanvas: React.FC<LiveTryOnCanvasProps> = ({ selectedShade }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // The render loop (set up once below) reads the shade/texture through refs
  // so switching shades doesn't tear down and restart the camera + tracker.
  const shadeRef = useRef<Shade | null>(selectedShade);
  const colorMapRef = useRef<HTMLImageElement | null>(null);
  shadeRef.current = selectedShade;

  // Fetch the selected shade's extracted color-map texture whenever it changes.
  useEffect(() => {
    if (!selectedShade || selectedShade.extractionStatus !== 'ready' || !selectedShade.assetId) {
      colorMapRef.current = null;
      return;
    }
    let cancelled = false;
    const endpoint = resolveDynamicEndpoint('match', `/api/matching/shade-assets/${selectedShade.assetId}`);
    fetch(endpoint)
      .then((res) => res.json())
      .then((data: { asset?: ShadeAsset }) => {
        if (cancelled || !data.asset) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!cancelled) colorMapRef.current = img;
        };
        img.src = data.asset.colorMapUrl;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedShade]);

  // Start the camera once.
  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err: any) {
        setCameraError(err?.message || 'Camera access was denied.');
      }
    })();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Initialize MediaPipe FaceMesh once the video is playing, and composite
  // the selected shade's color onto the tracked face region every frame:
  // draw the camera frame, clip to the region's landmark contour, then tint
  // it with the shade's hex color (and multiply-blend the extracted color
  // map texture on top once it's loaded) so the live feed shows makeup on
  // the actual moving face rather than a static overlay.
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    let disposed = false;

    (async () => {
      const { FaceMesh } = await import('@mediapipe/face_mesh');
      const { Camera } = await import('@mediapipe/camera_utils');

      const faceMesh = new FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true });

      faceMesh.onResults((results) => {
        if (disposed) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !canvasRef.current || !videoRef.current) return;
        const { width, height } = canvasRef.current;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(videoRef.current, 0, 0, width, height);

        // If camera/tracking fails or drops below an acceptable confidence,
        // the AR overlay hides rather than rendering on a misdetected face
        // -- just the bare camera feed drawn above, nothing more.
        const landmarks = results.multiFaceLandmarks?.[0] as FaceLandmark[] | undefined;
        const shade = shadeRef.current;
        if (!landmarks || !shade || shade.extractionStatus !== 'ready') return;

        const paths = buildRegionPaths(landmarks, shade.region, width, height);

        ctx.save();
        const combined = new Path2D();
        paths.forEach((p) => combined.addPath(p));
        ctx.clip(combined);

        ctx.globalAlpha = REGION_TINT_ALPHA[shade.region];
        ctx.fillStyle = shade.hexColor;
        ctx.fillRect(0, 0, width, height);

        const colorMap = colorMapRef.current;
        if (colorMap) {
          ctx.globalAlpha = 0.35;
          ctx.globalCompositeOperation = 'multiply';
          ctx.drawImage(colorMap, 0, 0, width, height);
        }

        ctx.restore();
      });

      const camera = new Camera(videoRef.current!, {
        onFrame: async () => {
          if (videoRef.current) await faceMesh.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    })();

    return () => {
      disposed = true;
    };
  }, []);

  if (cameraError) {
    return <p className="text-xs text-destructive">{cameraError}</p>;
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950">
      <video ref={videoRef} className="hidden" muted playsInline />
      <canvas ref={canvasRef} width={640} height={480} className="w-full h-full" />
      {selectedShade && selectedShade.extractionStatus !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs">
          This shade isn't ready for try-on yet ({selectedShade.extractionStatus}).
        </div>
      )}
    </div>
  );
};
