'use client';
import React, { useState, useRef } from 'react';
import { BeautyClient } from '../../core/client';
import { PolygonHeatmap } from '../vision/PolygonHeatmap';
import { AgingProgressionSlider } from '../vision/AgingProgressionSlider';
import type { VisionAnalysisResponse, BeautyClientConfig } from '../../core/types';

export interface BeautyExperienceWidgetProps extends BeautyClientConfig {
  onComplete?: (result: VisionAnalysisResponse) => void;
  onAddToCart?: (sku: string) => void;
  /** Dimension codes to analyse, as the tenant's reference data names them.
   *  Omitted: no `dimensions` field is sent and the engine applies the
   *  application's own configuration. */
  dimensions?: string[];
  /** The customer's age in years, if known. Omitted: not sent. */
  initialAge?: number;
  /** The UV index at the customer's location, if known. Omitted: not sent. */
  initialUvIndex?: number;
  className?: string;
}

export const BeautyExperienceWidget: React.FC<BeautyExperienceWidgetProps> = ({
  gatewayUrl,
  apiKey,
  token,
  brandId,
  applicationId,
  onComplete,
  onAddToCart,
  dimensions,
  initialAge,
  initialUvIndex,
  className = '',
}) => {
  const [client] = useState(() => new BeautyClient({ gatewayUrl, apiKey, token, brandId, applicationId }));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResponse | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only what the integrator supplied is sent; the client drops undefined
  // fields, so nothing here stands in for a value nobody provided.
  const runAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const result = await client.analyzeImage(file, {
        dimensions,
        chronologicalAge: initialAge,
        uvIndex: initialUvIndex,
      });
      setAnalysisResult(result);
      if (onComplete) onComplete(result);
    } catch (err: any) {
      alert(`Analisis gagal: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCurrentFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setAnalysisResult(null);

    await runAnalysis(file);
  };

  return (
    <div className={`rounded-3xl border border-white/10 bg-neutral-950 p-6 md:p-8 text-white shadow-2xl ${className}`}>
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Clinical Face Diagnostics</span>
          <h2 className="text-xl md:text-2xl font-black text-white">AI Vision UV & Aging Longevity Analyzer</h2>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-blue-500 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {imagePreview ? 'Ambil Ulang' : 'Upload / Capture Wajah'}
          </button>
        </div>
      </div>

      {!imagePreview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 py-16 px-4 text-center cursor-pointer hover:border-blue-500/50 hover:bg-white/[0.07] transition-all"
        >
          <div className="rounded-full bg-blue-500/10 p-4 text-blue-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-semibold text-white">Unggah Foto Wajah atau Tangkapan Kamera UV</p>
          <p className="mt-1 text-xs text-neutral-400 max-w-sm">
            Engine akan melakukan segmentasi 8 zona poligon, menganalisis daya serap sunscreen (UV), dan mensimulasikan proyeksi penuaan.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Polygon Heatmap */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {isAnalyzing ? (
              <div className="h-96 w-full flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 animate-pulse">
                <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-xs font-semibold text-neutral-300">Memproses 8 Zona Poligon & Spektrum UV...</p>
              </div>
            ) : analysisResult ? (
              <PolygonHeatmap
                imageSrc={imagePreview}
                zones={analysisResult.zones}
                zoneMetrics={analysisResult.zoneMetrics}
                selectedZoneCode={selectedZone}
                onSelectZone={(code: string) => setSelectedZone(code)}
                className="w-full aspect-square"
              />
            ) : null}
          </div>

          {/* Right Column: Longevity Slider */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {analysisResult && (
              <>
                {/* Global Score Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">UV Protection Defense</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{analysisResult.overallCoverageScore}</span>
                      <span className="text-xs text-neutral-400">/ 100</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Skin Longevity Index</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{analysisResult.skinLongevityScore}</span>
                      <span className="text-xs text-neutral-400">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Aging Simulation Slider */}
                {analysisResult.agingSimulation && (
                  <AgingProgressionSlider agingData={analysisResult.agingSimulation} />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
