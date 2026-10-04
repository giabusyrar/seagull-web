'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ImagePlus, Loader2, RefreshCw, Wand2, X } from 'lucide-react';
import { Button, EmptyState } from '@gateway-experience/shared';
import { colourTryOn, fetchColourCatalog } from '../../api';
import type { ColourCatalog } from '../../types';

/** The message to show for a failed call: the engine's own text when it sent one. */
const errorMessage = (e: unknown) => (e instanceof Error && e.message ? e.message : String(e));

/** An object URL for a blob, revoked when the blob changes or the view unmounts. */
function useObjectUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

/**
 * Photo try-on through the colour engine: pick a face photo and at most one
 * shade per catalog category, and the engine renders the whole look onto the
 * photo (POST /tryon, a PNG). Shades come from GET /catalog and are sent by
 * id only; the engine resolves their colours. A failed call shows the
 * engine's error, never a stand-in image.
 */
export const PhotoTryOnTab: React.FC = () => {
  const [catalog, setCatalog] = useState<ColourCatalog | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  // category -> shadeId: one shade per category, as the engine accepts.
  const [selected, setSelected] = useState<Record<string, string>>({});

  const [result, setResult] = useState<Blob | null>(null);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  // Drops a response that arrives after the photo or the look changed.
  const requestId = useRef(0);

  const photoUrl = useObjectUrl(photo);
  const resultUrl = useObjectUrl(result);

  const loadCatalog = useCallback(() => {
    setCatalogLoading(true);
    setCatalogError(null);
    fetchColourCatalog()
      .then(setCatalog)
      .catch((e) => setCatalogError(errorMessage(e)))
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const resetResult = () => {
    requestId.current += 1;
    setResult(null);
    setRendering(false);
    setRenderError(null);
  };

  const choosePhoto = (file: File | null) => {
    resetResult();
    setPhoto(file);
  };

  const toggleShade = (category: string, shadeId: string) => {
    resetResult();
    setSelected((prev) => {
      const next = { ...prev };
      if (next[category] === shadeId) delete next[category];
      else next[category] = shadeId;
      return next;
    });
  };

  const shadeIds = Object.values(selected);

  const render = async () => {
    if (!photo || shadeIds.length === 0) return;
    const id = ++requestId.current;
    setRendering(true);
    setRenderError(null);
    setResult(null);
    try {
      const png = await colourTryOn(photo, shadeIds);
      if (id === requestId.current) setResult(png);
    } catch (e) {
      if (id === requestId.current) setRenderError(errorMessage(e));
    } finally {
      if (id === requestId.current) setRendering(false);
    }
  };

  const categories = Object.entries(catalog ?? {}).filter(([, shades]) => Array.isArray(shades) && shades.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 sm:gap-6">
      {/* Photo + shade picker */}
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">1. Face photo</h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded border border-border bg-secondary/40 hover:border-primary/60 text-xs font-semibold cursor-pointer">
              <ImagePlus className="h-3.5 w-3.5" />
              <span>{photo ? 'Change photo' : 'Choose photo'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  choosePhoto(e.target.files?.[0] ?? null);
                  e.target.value = '';
                }}
              />
            </label>
            {photo && (
              <>
                <span className="text-[11px] text-muted-foreground truncate max-w-[180px]" title={photo.name}>
                  {photo.name}
                </span>
                <Button variant="ghost" size="icon-xs" onClick={() => choosePhoto(null)} title="Remove photo">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">2. Shades (one per category)</h3>
            {shadeIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  resetResult();
                  setSelected({});
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {catalogLoading && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading the try-on catalog...
            </p>
          )}

          {!catalogLoading && catalogError && (
            <div className="flex items-start justify-between gap-2 rounded border border-destructive/40 bg-destructive/10 px-3 py-2">
              <p className="text-xs text-destructive">Could not load the catalog: {catalogError}</p>
              <Button variant="ghost" size="icon-xs" onClick={loadCatalog} title="Retry">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {!catalogLoading && !catalogError && categories.length === 0 && (
            <p className="text-xs text-muted-foreground">The colour engine's catalog has no shades to try.</p>
          )}

          {categories.map(([category, shades]) => (
            <div key={category} className="space-y-1.5">
              <p className="text-[11px] font-semibold capitalize text-foreground">{category}</p>
              <div className="flex flex-wrap gap-2">
                {shades.map((s) => {
                  const isSelected = selected[category] === s.shadeId;
                  return (
                    <button
                      key={s.shadeId}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleShade(category, s.shadeId)}
                      title={`${s.productName} — ${s.shadeName} (${s.hexColor})`}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${
                        isSelected ? 'border-primary ring-2 ring-primary/40' : 'border-border hover:border-primary/60'
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: s.hexColor }} />
                      <span>{s.shadeName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={render} disabled={!photo || shadeIds.length === 0 || rendering} className="w-full">
          {rendering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          <span>{rendering ? 'Rendering...' : 'Render try-on'}</span>
        </Button>
      </div>

      {/* Before / after */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        {!photoUrl ? (
          <EmptyState
            icon={<ImagePlus className="h-6 w-6" />}
            title="No photo yet"
            description="Choose a face photo and the shades to try; the colour engine renders the look onto it."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <figure className="space-y-1.5">
              <figcaption className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Before</figcaption>
              <img src={photoUrl} alt="Original photo" className="w-full rounded-lg border border-border object-contain bg-black/40" />
            </figure>
            <figure className="space-y-1.5">
              <figcaption className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">After</figcaption>
              {resultUrl ? (
                <img src={resultUrl} alt="Photo with the selected shades rendered" className="w-full rounded-lg border border-border object-contain bg-black/40" />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  {rendering ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" /> Rendering...
                    </span>
                  ) : renderError ? (
                    <span className="flex flex-col items-center gap-1.5 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Try-on failed: {renderError}</span>
                    </span>
                  ) : shadeIds.length === 0 ? (
                    'Pick at least one shade.'
                  ) : (
                    'Press "Render try-on".'
                  )}
                </div>
              )}
            </figure>
          </div>
        )}
      </div>
    </div>
  );
};
