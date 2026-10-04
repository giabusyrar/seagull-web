'use client';
import { useEffect } from 'react';
import { createElement } from 'react';

export function GlbViewer({ src }: { src: string }) {
  useEffect(() => { import('@google/model-viewer'); }, []);
  return createElement('model-viewer', { src, 'camera-controls': true, 'auto-rotate': true, style: { width: '100%', height: 420, background: '#f4f4f5' } });
}
