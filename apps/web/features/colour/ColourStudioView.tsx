'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Download, Palette, RotateCcw, Sparkles, Undo2 } from 'lucide-react';
import { Button, cn } from '@gateway-experience/shared';
import { useCoreCollection } from '@/lib/hooks/use-core-collection';
import { AnalysisCard } from './AnalysisCard';
import { BeforeAfter } from './BeforeAfter';
import { CameraCapture } from './CameraCapture';
import { ProductPicker } from './ProductPicker';
import { useTryOn } from './useTryOn';
import { catalogOf, errorText, readApiError, type AnalyzeResult, type ApiError, type CatalogResult } from './types';

type YesNo = 'yes' | 'no' | '';
type Step = 'capture' | 'questions' | 'tryon';

/**
 * Personal colour analysis + photo try-on, laid out like the brand's existing
 * try-on (photo with a before/after handle on the left; category tabs,
 * product cards and "Warna Tersedia" on the right), in the Seagull theme.
 *
 * Flow: photo (camera or upload) → two required questions → analysis
 * (POST /core/colour-engine/analyze, which also returns every shade to try,
 * the ones that suit the person marked) → try-on (POST
 * /core/colour-engine/tryon, one shade per category). The analysis can be
 * skipped: "Langsung coba makeup" loads the catalog (GET
 * /core/colour-engine/catalog) and goes straight to the try-on.
 */
export function ColourStudioView() {
  const { getEndpoint } = useCoreCollection();

  const [file, setFile] = useState<File | null>(null);
  const photoUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const [hijab, setHijab] = useState<YesNo>('');
  const [hairVisible, setHairVisible] = useState<YesNo>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [plain, setPlain] = useState<CatalogResult | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [look, setLook] = useState<Record<string, string>>({});
  const tryon = useTryOn(file, getEndpoint);

  useEffect(
    () => () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    },
    [photoUrl],
  );

  const step: Step = !file ? 'capture' : result || plain ? 'tryon' : 'questions';
  const catalog = useMemo(() => (result ? catalogOf(result) : plain?.catalog ?? {}), [result, plain]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setPlain(null);
    setError(null);
    setLook({});
    setHijab('');
    setHairVisible('');
  };

  const analyze = async () => {
    if (!file || hijab === '' || hairVisible === '') return;
    setAnalyzing(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('hijab', String(hijab === 'yes'));
      fd.append('hairVisible', String(hairVisible === 'yes'));
      const res = await fetch(getEndpoint('colour', '/analyze'), { method: 'POST', body: fd });
      if (!res.ok) throw await readApiError(res);
      setResult((await res.json()) as AnalyzeResult);
    } catch (e: unknown) {
      const err = e as Partial<ApiError>;
      setError({ status: err.status ?? 0, code: err.code ?? '', message: err.message ?? String(e) });
    } finally {
      setAnalyzing(false);
    }
  };

  const tryWithoutAnalysis = async () => {
    setLoadingCatalog(true);
    setError(null);
    try {
      const res = await fetch(getEndpoint('colour', '/catalog'));
      if (!res.ok) throw await readApiError(res);
      setPlain((await res.json()) as CatalogResult);
    } catch (e: unknown) {
      const err = e as Partial<ApiError>;
      setError({ status: err.status ?? 0, code: err.code ?? '', message: err.message ?? String(e) });
    } finally {
      setLoadingCatalog(false);
    }
  };

  const pick = (category: string, shadeId: string | null) => {
    const next = { ...look };
    if (shadeId) next[category] = shadeId;
    else delete next[category];
    setLook(next);
    tryon.request(Object.values(next));
  };

  const clearLook = () => {
    setLook({});
    tryon.request([]);
  };

  return (
    <div className="flex-1 min-w-0 overflow-auto bg-muted/30">
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Personal Colour &amp; Virtual Try-On</div>
            <h1 className="text-lg font-bold text-foreground">Coba warna yang cocok untukmu</h1>
          </div>
          <Stepper step={step} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-5 items-start">
          {/* Left: photo */}
          <div className="rounded-2xl border border-border bg-card p-3 shadow-xs lg:sticky lg:top-4">
            {step === 'capture' && <CameraCapture onPhoto={setFile} />}
            {step !== 'capture' && photoUrl && (
              <div className="flex flex-col gap-3">
                <BeforeAfter before={photoUrl} after={tryon.url} loading={tryon.loading} className="w-full aspect-[3/4]" />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={reset}>
                    Foto ulang
                  </Button>
                  {step === 'tryon' && (
                    <>
                      <Button variant="outline" size="sm" leftIcon={<Undo2 className="h-3.5 w-3.5" />} onClick={clearLook} disabled={!Object.keys(look).length}>
                        Hapus semua
                      </Button>
                      <a
                        href={tryon.url ?? undefined}
                        download="coba-makeup.png"
                        aria-disabled={!tryon.url}
                        className={cn(
                          'ml-auto inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground transition hover:bg-primary/90',
                          !tryon.url && 'pointer-events-none opacity-50',
                        )}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Simpan foto
                      </a>
                    </>
                  )}
                </div>
                {tryon.error && <p className="text-xs text-destructive">{errorText(tryon.error)}</p>}
              </div>
            )}
          </div>

          {/* Right: questions, or the try-on panel */}
          <div className="flex flex-col gap-4 min-w-0">
            {step === 'capture' && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 text-sm">
                <p className="font-bold text-foreground">Cara kerjanya</p>
                <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground text-xs">
                  <li>Ambil atau unggah foto wajah.</li>
                  <li>Jawab dua pertanyaan singkat untuk analisis warna, atau langsung coba makeup.</li>
                  <li>
                    Coba foundation, lipstik, eyeshadow, eyeliner, maskara, alis, dan blush langsung di fotomu. Setelah analisis, shade yang
                    cocok untukmu ditandai.
                  </li>
                </ol>
              </div>
            )}

            {step === 'questions' && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sebelum analisis</div>
                <YesNoField label="Memakai hijab atau penutup kepala?" value={hijab} onChange={setHijab} />
                <YesNoField label="Rambut terlihat di foto?" value={hairVisible} onChange={setHairVisible} />
                <Button
                  size="lg"
                  className="w-full"
                  isLoading={analyzing}
                  disabled={hijab === '' || hairVisible === ''}
                  leftIcon={<Sparkles className="h-4 w-4" />}
                  onClick={analyze}
                >
                  {analyzing ? 'Menganalisis…' : 'Analisis warna'}
                </Button>
                {(hijab === '' || hairVisible === '') && <p className="text-[11px] text-muted-foreground">Jawab kedua pertanyaan untuk melanjutkan.</p>}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  atau
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  isLoading={loadingCatalog}
                  disabled={analyzing}
                  leftIcon={<Palette className="h-4 w-4" />}
                  onClick={tryWithoutAnalysis}
                >
                  Langsung coba makeup
                </Button>
                <p className="text-[11px] text-muted-foreground">Tanpa analisis, semua shade tetap bisa dicoba, hanya belum ditandai mana yang cocok.</p>
                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{errorText(error)}</div>
                )}
              </div>
            )}

            {step === 'tryon' && (
              <>
                {result ? (
                  <AnalysisCard result={result} />
                ) : (
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Analisis warna</div>
                      <p className="text-xs text-muted-foreground">Belum dijalankan. Analisis untuk menandai shade yang cocok untukmu.</p>
                    </div>
                    <Button size="sm" leftIcon={<Sparkles className="h-3.5 w-3.5" />} onClick={() => setPlain(null)}>
                      Analisis warna
                    </Button>
                  </div>
                )}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
                  <ProductPicker catalog={catalog} look={look} onPick={pick} analyzed={!!result} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: [Step, string][] = [
    ['capture', 'Foto'],
    ['questions', 'Analisis'],
    ['tryon', 'Coba makeup'],
  ];
  const at = steps.findIndex(([s]) => s === step);
  return (
    <ol className="flex items-center gap-2 text-[11px] font-semibold">
      {steps.map(([s, label], i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={cn(
              'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border',
              i <= at ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border',
            )}
          >
            {i + 1}
          </span>
          <span className={i === at ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
          {i < steps.length - 1 && <span className="w-4 h-px bg-border" />}
        </li>
      ))}
    </ol>
  );
}

function YesNoField({ label, value, onChange }: { label: string; value: YesNo; onChange: (v: YesNo) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-foreground">{label}</span>
      <div className="flex gap-1 rounded-xl border border-border bg-secondary/50 p-1">
        {(['yes', 'no'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
              value === v ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {v === 'yes' ? 'Ya' : 'Tidak'}
          </button>
        ))}
      </div>
    </div>
  );
}
