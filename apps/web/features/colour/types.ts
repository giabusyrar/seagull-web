// Response shapes of the colour engine (seagull-core docs/PCA-VTO-CONTRACT.md).

export type ColourSource = 'cube' | 'swatch' | 'estimate';

export interface Recommendation {
  shadeId: string;
  productId: string;
  productName: string;
  /** The product's photo; '' (or absent, from an older engine) when the catalog has none. */
  productImageUrl?: string;
  shadeName: string;
  hexColor: string;
  hueName: string;
  status: 'same_quadrant' | 'complementary';
  colourSource: ColourSource;
}

/**
 * One shade of the try-on catalog. `status` is empty when the shade is not
 * kept for this person, when its category is not rated (brow, eyeliner,
 * mascara), or when no analysis ran. `mode` is the render style.
 */
export interface CatalogShade {
  shadeId: string;
  productId: string;
  productName: string;
  /** The product's photo; '' (or absent, from an older engine) when the catalog has none. */
  productImageUrl?: string;
  shadeName: string;
  hexColor: string;
  hueName: string;
  status: 'same_quadrant' | 'complementary' | '';
  colourSource: ColourSource;
  mode: string;
}

export type Catalog = Record<string, CatalogShade[]>;

/** GET /core/colour-engine/catalog: every shade, without an analysis. */
export interface CatalogResult {
  catalog: Catalog;
  configVersion: string;
}

export interface AnalyzeResult {
  quadrant: { code: string; technicalName: string; displayName: string | null; provisional: boolean };
  complementary: { codes: string[]; temperatureRule: string; provisional: boolean };
  labels: {
    undertone: string;
    value: string;
    chroma: string;
    seasonEquivalents: string[];
    seasonsProvisional: boolean;
  };
  foundationBand: string;
  flags: string[];
  qualityFailed: string[];
  recommendations: Record<string, Recommendation[]>;
  catalog?: Catalog;
  configVersion: string;
}

/**
 * The analysis' try-on catalog. An engine older than the catalog field only
 * sends recommendations; those are used as they are (fewer shades, none
 * missing that the engine kept).
 */
export function catalogOf(result: AnalyzeResult): Catalog {
  if (result.catalog) return result.catalog;
  const out: Catalog = {};
  for (const [cat, recs] of Object.entries(result.recommendations ?? {})) {
    out[cat] = recs.map((r) => ({ ...r, mode: '' }));
  }
  return out;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

export interface Product {
  productId: string;
  productName: string;
  /** The product's photo, when the catalog has one. */
  imageUrl?: string;
  shades: CatalogShade[];
}

// Tabs follow the brand's existing try-on (Complexion, Lip, Eye, Blush On).
// A category the engine returns that is not listed here is shown under
// "Lainnya" with its raw name, so nothing from the catalog is hidden.
export interface CategoryGroup {
  id: string;
  label: string;
  categories: string[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { id: 'complexion', label: 'Complexion', categories: ['complexion'] },
  { id: 'lip', label: 'Lip', categories: ['lip'] },
  { id: 'eye', label: 'Eye', categories: ['eyeshadow', 'eyeliner', 'mascara', 'brow'] },
  { id: 'blush', label: 'Blush On', categories: ['blush'] },
];

export const OTHER_GROUP_ID = 'other';

export const CATEGORY_LABEL: Record<string, string> = {
  complexion: 'Foundation',
  lip: 'Lipstik',
  eyeshadow: 'Eyeshadow',
  eyeliner: 'Eyeliner',
  mascara: 'Maskara',
  brow: 'Alis',
  blush: 'Blush On',
};

export function groupProducts(shades: CatalogShade[]): Product[] {
  const byId = new Map<string, Product>();
  for (const r of shades) {
    const p = byId.get(r.productId);
    if (p) {
      p.shades.push(r);
      if (!p.imageUrl && r.productImageUrl) p.imageUrl = r.productImageUrl;
    } else {
      byId.set(r.productId, {
        productId: r.productId,
        productName: r.productName,
        imageUrl: r.productImageUrl || undefined,
        shades: [r],
      });
    }
  }
  return [...byId.values()];
}

export const isKept = (s: CatalogShade) => s.status === 'same_quadrant' || s.status === 'complementary';

// Render styles (`mode`) as the product card and shade info name them.
// Mascara is told apart by type; the others by the look drawn.
export const MODE_LABEL: Record<string, Record<string, string>> = {
  mascara: { natural: 'Natural', volumizing: 'Volumizing', lengthening: 'Lengthening' },
  eyeliner: { thin: 'Garis tipis', classic: 'Klasik', cat_eye: 'Cat eye', smoky: 'Smoky' },
  eyeshadow: { natural: 'Natural', soft_glam: 'Soft glam', smoky: 'Smoky' },
  blush: { lifted: 'Lifted', apple: 'Apple', draping: 'Draping' },
};

export const MODE_KIND: Record<string, string> = {
  mascara: 'Tipe',
  eyeliner: 'Gaya',
  eyeshadow: 'Gaya',
  blush: 'Gaya',
};

/** The product's style when all its shades share one, else ''. */
export function productMode(p: Product): string {
  const modes = new Set(p.shades.map((s) => s.mode));
  return modes.size === 1 ? [...modes][0] : '';
}

// What the colour of a shade is based on, for the user.
export const SOURCE_NOTE: Partial<Record<ColourSource, string>> = {
  swatch: 'Warna dari kemasan, belum diukur di kulit.',
  estimate: 'Warna perkiraan untuk demo, belum dari data brand.',
};

// Quality checks from the measurement pipeline (pipeline_03 QC_RULES), as
// advice: live while the camera is on (capture/), and for the next photo
// after the analysis.
export const QC_ADVICE: Record<string, string> = {
  tidak_ada_wajah: 'Wajah tidak terlihat. Pastikan seluruh wajah masuk bingkai.',
  wajah_ganda: 'Ada lebih dari satu wajah di foto. Foto sendiri saja.',
  terlalu_gelap: 'Foto terlalu gelap. Cari cahaya yang lebih terang dan rata.',
  terlalu_terang: 'Sebagian wajah terlalu terang. Hindari cahaya langsung atau lampu kilat.',
  cahaya_campuran: 'Cahaya bercampur (lampu dan cahaya jendela). Pakai satu sumber cahaya.',
  menoleh: 'Wajah menoleh. Hadapkan wajah lurus ke kamera.',
  mendongak_menunduk: 'Wajah mendongak atau menunduk. Tegakkan kepala.',
  miring: 'Kepala miring. Luruskan kepala.',
  ekspresi: 'Ekspresi wajah kuat. Rilekskan wajah, jangan tersenyum lebar atau membuka mulut.',
  mata_tertutup: 'Mata tertutup. Buka mata saat foto diambil.',
  tertutup: 'Sebagian wajah tertutup (rambut, tangan, atau kacamata). Buka area wajah.',
  blur: 'Foto buram. Pegang kamera lebih stabil.',
  wajah_kecil: 'Wajah terlalu kecil di foto. Dekatkan wajah ke kamera.',
  wajah_besar: 'Wajah terlalu dekat. Mundur sedikit dari kamera.',
  tidak_di_tengah: 'Wajah tidak di tengah. Posisikan wajah di tengah bingkai.',
};

export const FLAG_TEXT: Record<string, string> = {
  uneven_skin_tone: 'Warna kulit di beberapa titik wajah berbeda cukup jauh; hasil sebaiknya dicek dengan foto ulang.',
  chroma_approximated: 'Sebagian perhitungan warna memakai pendekatan.',
  hair_not_used: 'Warna rambut tidak dipakai dalam analisis.',
};

// User-facing text per engine error code (core-engine colour_handler.go).
export function errorText(err: ApiError): string {
  switch (err.code) {
    case 'no_face_detected':
      return 'Wajah tidak terdeteksi. Pastikan seluruh wajah terlihat, menghadap kamera, dengan cahaya cukup.';
    case 'measurement_failed':
      return 'Foto belum bisa dianalisis. Coba foto ulang di cahaya yang lebih rata.';
    case 'worker_unavailable':
    case 'colour_engine_disabled':
      return 'Layanan analisis sedang tidak tersedia. Coba lagi beberapa saat lagi.';
    case 'shade_not_found':
      return 'Shade ini tidak ditemukan di katalog.';
    case 'invalid_input':
      return 'Foto tidak valid atau terlalu besar. Pakai foto JPEG atau PNG.';
    default:
      if (err.status >= 500) return 'Layanan analisis sedang tidak tersedia. Coba lagi beberapa saat lagi.';
      return 'Terjadi kesalahan. Coba lagi.';
  }
}

export async function readApiError(res: Response): Promise<ApiError> {
  const text = await res.text();
  try {
    const j = JSON.parse(text);
    return { status: res.status, code: String(j.code || ''), message: String(j.error || j.message || '') };
  } catch {
    return { status: res.status, code: '', message: text };
  }
}
