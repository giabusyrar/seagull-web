'use client';

import React from 'react';
import { Download, FileText, Music, Video, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';

export interface MimeViewerProps {
  contentType?: string;
  responseBody: string;
  responseBlobUrl?: string;
  filename?: string;
  className?: string;
}

export const MimeViewer: React.FC<MimeViewerProps> = ({
  contentType = 'application/json',
  responseBody,
  responseBlobUrl,
  filename = 'response_data',
  className = '',
}) => {
  const mime = contentType.toLowerCase();

  if (mime.startsWith('image/')) {
    const src = responseBlobUrl || (responseBody.startsWith('data:') ? responseBody : `data:${contentType};base64,${responseBody}`);
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl space-y-3', className)}>
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
          <ImageIcon className="w-4 h-4 text-emerald-400" /> Image Response ({contentType})
        </div>
        <img src={src} alt="Response Preview" className="max-h-96 max-w-full rounded-lg border border-border shadow-md object-contain" />
      </div>
    );
  }

  if (mime.includes('pdf')) {
    const pdfSrc = responseBlobUrl || `data:application/pdf;base64,${responseBody}`;
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted px-4 py-2 rounded-xl border border-border">
          <span className="font-semibold text-foreground">PDF Document ({contentType})</span>
          <a
            href={pdfSrc}
            download={`${filename}.pdf`}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </a>
        </div>
        <iframe src={pdfSrc} className="w-full h-96 rounded-xl border border-border bg-card" title="PDF Response Preview" />
      </div>
    );
  }

  if (mime.startsWith('audio/')) {
    const audioSrc = responseBlobUrl || `data:${contentType};base64,${responseBody}`;
    return (
      <div className={cn('p-6 bg-card border border-border rounded-xl space-y-4 flex flex-col items-center', className)}>
        <div className="flex items-center gap-2 text-foreground text-xs font-semibold">
          <Music className="w-4 h-4 text-sky-400" /> Audio Stream ({contentType})
        </div>
        <audio controls src={audioSrc} className="w-full max-w-md" />
      </div>
    );
  }

  if (mime.startsWith('video/')) {
    const videoSrc = responseBlobUrl || `data:${contentType};base64,${responseBody}`;
    return (
      <div className={cn('p-4 bg-card border border-border rounded-xl space-y-3 flex flex-col items-center', className)}>
        <div className="flex items-center gap-2 text-foreground text-xs font-semibold">
          <Video className="w-4 h-4 text-purple-400" /> Video Stream ({contentType})
        </div>
        <video controls src={videoSrc} className="max-h-80 max-w-full rounded-lg border border-border" />
      </div>
    );
  }

  if (mime.includes('octet-stream') || mime.includes('zip') || mime.includes('tar')) {
    const downloadSrc = responseBlobUrl || `data:${contentType};base64,${responseBody}`;
    return (
      <div className={cn('p-8 bg-card border border-border rounded-xl text-center space-y-4 shadow-xs', className)}>
        <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">Binary Payload Detected</h4>
          <p className="text-xs text-muted-foreground">Content Type: {contentType}</p>
        </div>
        <a
          href={downloadSrc}
          download={filename}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 transition"
        >
          <Download className="w-4 h-4" /> Download Binary File
        </a>
      </div>
    );
  }

  return (
    <pre className={cn('p-4 bg-muted/40 border border-border rounded-xl text-foreground font-mono text-xs overflow-x-auto max-h-96 leading-relaxed select-all', className)}>
      {responseBody}
    </pre>
  );
};
