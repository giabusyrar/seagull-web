'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Ban, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge, TabNav, cn, type TabItem } from '@gateway-experience/shared';
import {
  CATEGORY_GROUPS,
  CATEGORY_LABEL,
  MODE_KIND,
  MODE_LABEL,
  OTHER_GROUP_ID,
  SOURCE_NOTE,
  groupProducts,
  isKept,
  productMode,
  type Catalog,
  type CatalogShade,
  type CategoryGroup,
  type Product,
} from './types';

interface ProductPickerProps {
  catalog: Catalog;
  look: Record<string, string>; // category -> shadeId
  onPick: (category: string, shadeId: string | null) => void;
  /** True when the catalog carries this person's analysis (statuses). */
  analyzed: boolean;
}

function useGroups(catalog: Catalog): CategoryGroup[] {
  return useMemo(() => {
    const present = Object.keys(catalog).filter((k) => catalog[k]?.length);
    const groups = CATEGORY_GROUPS.map((g) => ({ ...g, categories: g.categories.filter((c) => present.includes(c)) })).filter(
      (g) => g.categories.length,
    );
    const known = new Set(CATEGORY_GROUPS.flatMap((g) => g.categories));
    const other = present.filter((c) => !known.has(c)).sort();
    if (other.length) groups.push({ id: OTHER_GROUP_ID, label: 'Lainnya', categories: other });
    return groups;
  }, [catalog]);
}

const modeLabel = (category: string, mode: string) => (mode && MODE_LABEL[category]?.[mode]) || '';

/**
 * The brand's existing try-on layout: category tabs, a carousel of product
 * cards, then "Warna Tersedia" — the selected product's shades. Every shade
 * in the catalog can be tried; after an analysis the ones that suit the
 * person are marked, and "Cocok untukmu" narrows the list to them. One shade
 * per category; picking re-renders the whole look.
 */
export function ProductPicker({ catalog, look, onPick, analyzed }: ProductPickerProps) {
  const groups = useGroups(catalog);
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '');
  const group = groups.find((g) => g.id === groupId) ?? groups[0];
  const [catByGroup, setCatByGroup] = useState<Record<string, string>>({});
  const category = (group && catByGroup[group.id]) || group?.categories[0] || '';
  const all = useMemo(() => catalog[category] ?? [], [catalog, category]);

  const keptCount = analyzed ? all.filter(isKept).length : 0;
  const [onlyKept, setOnlyKept] = useState(false);
  const filtering = onlyKept && keptCount > 0;
  const products = useMemo(() => groupProducts(filtering ? all.filter(isKept) : all), [all, filtering]);

  const selectedShade = all.find((r) => r.shadeId === look[category]) ?? null;
  const [productByCat, setProductByCat] = useState<Record<string, string>>({});
  const wanted = productByCat[category] || selectedShade?.productId || '';
  const product = products.find((p) => p.productId === wanted) ?? products[0];

  const tabs: TabItem[] = groups.map((g) => ({
    id: g.id,
    label: g.label,
    badge: g.categories.some((c) => look[c]) ? '•' : undefined,
  }));

  if (!group) {
    return <p className="text-sm text-muted-foreground">Belum ada produk di katalog.</p>;
  }

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <TabNav tabs={tabs} activeTab={group.id} onTabChange={setGroupId} className="self-start" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        {group.categories.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {group.categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCatByGroup((m) => ({ ...m, [group.id]: c }))}
                className={cn(
                  'px-3 py-1 rounded-full border text-xs font-semibold transition cursor-pointer',
                  c === category ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {CATEGORY_LABEL[c] || c}
                {look[c] ? ' •' : ''}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        {keptCount > 0 && (
          <div className="flex gap-1 rounded-xl border border-border bg-secondary/50 p-1 text-[11px] font-bold">
            {([false, true] as const).map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setOnlyKept(v)}
                className={cn(
                  'px-3 py-1 rounded-lg transition cursor-pointer',
                  filtering === v ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {v ? `Cocok untukmu (${keptCount})` : 'Semua'}
              </button>
            ))}
          </div>
        )}
      </div>

      <ProductCarousel
        category={category}
        products={products}
        activeId={product?.productId ?? ''}
        look={look[category]}
        analyzed={analyzed}
        onSelect={(id) => setProductByCat((m) => ({ ...m, [category]: id }))}
      />

      {product && (
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Warna Tersedia</span>
            <span className="text-[11px] text-muted-foreground truncate">{product.productName}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              title="Tanpa produk"
              onClick={() => onPick(category, null)}
              className={cn(
                'h-10 w-10 rounded-full border bg-background flex items-center justify-center text-muted-foreground cursor-pointer transition',
                !look[category] ? 'ring-2 ring-primary ring-offset-2 ring-offset-card border-transparent' : 'border-border hover:border-foreground/40',
              )}
            >
              <Ban className="h-4 w-4" />
            </button>
            {product.shades.map((s) => (
              <button
                key={s.shadeId}
                type="button"
                title={isKept(s) ? `${s.shadeName} · cocok untukmu` : s.shadeName}
                onClick={() => onPick(category, s.shadeId)}
                className={cn(
                  'relative h-10 w-10 rounded-full border border-black/10 cursor-pointer transition',
                  look[category] === s.shadeId ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : 'hover:scale-105',
                )}
                style={{ backgroundColor: s.hexColor }}
              >
                {analyzed && isKept(s) && (
                  <span className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground border-2 border-card flex items-center justify-center">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>
          <ShadeInfo category={category} shade={selectedShade && selectedShade.productId === product.productId ? selectedShade : null} />
        </div>
      )}
    </div>
  );
}

function ProductCarousel({
  category,
  products,
  activeId,
  look,
  analyzed,
  onSelect,
}: {
  category: string;
  products: Product[];
  activeId: string;
  look: string | undefined;
  analyzed: boolean;
  onSelect: (productId: string) => void;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const update = () => {
    const el = strip.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };
  useEffect(update, [products]);

  const scroll = (dir: -1 | 1) => strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <div className="relative">
      <div ref={strip} onScroll={update} className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none]">
        {products.map((p) => {
          const chosen = p.shades.find((s) => s.shadeId === look);
          const face = chosen ?? p.shades[0];
          const active = p.productId === activeId;
          const style = modeLabel(category, productMode(p));
          const kept = analyzed && p.shades.some(isKept);
          return (
            <button
              key={p.productId}
              type="button"
              onClick={() => onSelect(p.productId)}
              className={cn(
                'relative snap-start shrink-0 w-40 sm:w-44 rounded-2xl border bg-card p-3 flex flex-col items-center gap-3 text-left transition cursor-pointer shadow-xs',
                active ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-foreground/30',
              )}
            >
              {kept && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                  Cocok
                </span>
              )}
              {/* Product photos are not in the catalog API yet; the circle shows the shade colour. */}
              <div className="relative w-full aspect-square rounded-full flex items-center justify-center" style={{ backgroundColor: face.hexColor }}>
                <span className="text-2xl font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] px-2 text-center leading-tight line-clamp-2">
                  {chosen ? chosen.shadeName : `${p.shades.length}`}
                </span>
                {!chosen && (
                  <span className="absolute bottom-[18%] text-[10px] font-bold uppercase tracking-wider text-white/90 drop-shadow">warna</span>
                )}
              </div>
              <span className="w-full text-[11px] font-bold uppercase tracking-wide text-foreground text-center line-clamp-2 min-h-[2.2em]">
                {p.productName}
              </span>
              {style && (
                <span className="-mt-1.5 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {style}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {edges.left && (
        <button
          type="button"
          aria-label="Produk sebelumnya"
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-background border border-border shadow flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {edges.right && (
        <button
          type="button"
          aria-label="Produk berikutnya"
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-8 rounded-full bg-background border border-border shadow flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function ShadeInfo({ category, shade }: { category: string; shade: CatalogShade | null }) {
  if (!shade) {
    return <p className="text-xs text-muted-foreground">Pilih warna untuk mencoba di foto.</p>;
  }
  const style = modeLabel(category, shade.mode);
  const note = SOURCE_NOTE[shade.colourSource];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="font-bold text-foreground">{shade.shadeName}</span>
      {shade.hueName && shade.hueName !== '-' && <span className="text-muted-foreground">{shade.hueName}</span>}
      {style && (
        <span className="text-muted-foreground">
          {MODE_KIND[category] || 'Gaya'}: {style}
        </span>
      )}
      {shade.status && (
        <Badge variant={shade.status === 'same_quadrant' ? 'success' : 'default'}>
          {shade.status === 'same_quadrant' ? 'Sesuai kuadranmu' : 'Kuadran pendamping'}
        </Badge>
      )}
      {note && <span className="text-[11px] text-muted-foreground">{note}</span>}
    </div>
  );
}
