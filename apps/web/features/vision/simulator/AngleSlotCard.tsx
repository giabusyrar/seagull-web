'use client';

import React from 'react';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import type { AngleSlot, ImageAngle } from './types';

interface AngleSlotCardProps {
  slot: AngleSlot;
  isActive: boolean;
  onSelectSlot: (angle: ImageAngle) => void;
  onUploadFile: (angle: ImageAngle, file: File) => void;
  onClearSlot: (angle: ImageAngle) => void;
}

export function AngleSlotCard({
  slot,
  isActive,
  onSelectSlot,
  onUploadFile,
  onClearSlot,
}: AngleSlotCardProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(slot.angle, file);
    }
  };

  return (
    <div
      onClick={() => onSelectSlot(slot.angle)}
      className={`relative rounded-xl border p-2.5 transition-all cursor-pointer flex flex-col gap-2 ${
        isActive
          ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500 shadow-md'
          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-200">{slot.angle}</span>
          {slot.status === 'analyzed' && (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          )}
          {slot.status === 'error' && (
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
          )}
        </div>

        {slot.previewUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearSlot(slot.angle);
            }}
            className="text-slate-400 hover:text-red-400 p-0.5 rounded transition"
            title="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Thumbnail or Upload Placeholder */}
      <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
        {slot.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slot.previewUrl}
            alt={`${slot.angle} slot preview`}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900 transition">
            <Upload className="h-4 w-4 text-slate-500 mb-1" />
            <span className="text-[10px] text-slate-500 font-medium">Upload {slot.angle}</span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
