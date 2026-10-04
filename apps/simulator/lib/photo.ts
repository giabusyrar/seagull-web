// Pure request builders for the photo simulator. Every call goes straight to
// core-engine through the /svc/core rewrite; components run them via call().
import { svcPath } from './services';
import { CATEGORY_LABEL, type Catalog, type CatalogShade } from './types/colour';
import { DEFAULT_LANG, type Lang } from './i18n';

export interface Brand { brandId: string; applicationId: string }
export interface BuiltRequest { url: string; init: RequestInit }
export interface Views { front: File; left?: File | null; right?: File | null }

const post = (path: string, body: FormData): BuiltRequest => ({ url: svcPath('core', path), init: { method: 'POST', body } });

function brandPath(b: Brand): string {
  if (!b.brandId.trim()) throw new Error('brand is required');
  if (!b.applicationId.trim()) throw new Error('application is required');
  return `${encodeURIComponent(b.brandId)}/${encodeURIComponent(b.applicationId)}`;
}

export function analyzeColour(photo: File, hijab: boolean, hairVisible: boolean): BuiltRequest {
  const fd = new FormData();
  fd.append('image', photo);
  fd.append('hijab', hijab ? 'true' : 'false');
  fd.append('hairVisible', hairVisible ? 'true' : 'false');
  return post('/core/colour-engine/analyze', fd);
}

export function faceArchitecture(photo: File, brand: Brand): BuiltRequest {
  const fd = new FormData();
  fd.append('image', photo);
  return post(`/core/face-architecture/${brandPath(brand)}`, fd);
}

export function faceHead(views: Views, brand: Brand): BuiltRequest {
  const path = `/core/face-architecture/${brandPath(brand)}/head`;
  const fd = new FormData();
  fd.append('front', views.front);
  if (views.left) fd.append('left', views.left);
  if (views.right) fd.append('right', views.right);
  return post(path, fd);
}

export function skinAnalyze(views: Views, brand: Brand): BuiltRequest {
  const fd = new FormData();
  fd.append('image_front', views.front);
  if (views.left) fd.append('image_left', views.left);
  if (views.right) fd.append('image_right', views.right);
  fd.append('brandId', brand.brandId);
  fd.append('applicationId', brand.applicationId);
  return post('/core/vision-engine/analyze-image', fd);
}

export function tryOn(photo: File, shadeIds: string[]): BuiltRequest {
  const fd = new FormData();
  fd.append('image', photo);
  shadeIds.filter(Boolean).forEach((id) => fd.append('shadeIds', id));
  return post('/core/colour-engine/tryon', fd);
}

export interface ShadeCategory { category: string; label: string; shades: CatalogShade[] }
export interface ShadeGroup { id: string; label: string; categories: ShadeCategory[] }

const OTHER_LABEL: Record<Lang, string> = { en: 'Other', id: 'Lainnya' };
const GROUPS: { id: string; label: string; categories: string[] }[] = [
  { id: 'complexion', label: 'Complexion', categories: ['complexion'] },
  { id: 'lip', label: 'Lip', categories: ['lip'] },
  { id: 'eye', label: 'Eye', categories: ['eyeshadow', 'eyeliner', 'mascara', 'brow'] },
  { id: 'blush', label: 'Blush', categories: ['blush'] },
];

/** Catalog categories in the try-on order of seagull-web; unknown ones go under "Other". */
export function groupShades(catalog: Catalog | undefined | null, lang: Lang = DEFAULT_LANG): ShadeGroup[] {
  const byCat = new Map(Object.entries(catalog ?? {}).filter(([, s]) => Array.isArray(s) && s.length > 0));
  const cat = (c: string): ShadeCategory => ({ category: c, label: CATEGORY_LABEL[lang][c] ?? c, shades: byCat.get(c) ?? [] });
  const out: ShadeGroup[] = GROUPS
    .map((g) => ({ id: g.id, label: g.label, categories: g.categories.filter((c) => byCat.has(c)).map(cat) }))
    .filter((g) => g.categories.length > 0);
  const known = new Set(GROUPS.flatMap((g) => g.categories));
  const other = [...byCat.keys()].filter((c) => !known.has(c)).sort();
  if (other.length) out.push({ id: 'other', label: OTHER_LABEL[lang], categories: other.map(cat) });
  return out;
}

export type Selection = Record<string, string>;

/** One shade per category: picking the selected shade again clears it. */
export function toggleShade(selection: Selection, category: string, shadeId: string): Selection {
  const next = { ...selection };
  if (next[category] === shadeId) delete next[category];
  else next[category] = shadeId;
  return next;
}
