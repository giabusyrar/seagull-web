// Colour-engine response shapes, ported loosely from seagull-web
// features/colour/types.ts. Every field is optional: render "—" when absent.

export interface CatalogShade {
  shadeId: string;
  productId?: string;
  productName?: string;
  productImageUrl?: string;
  shadeName?: string;
  hexColor?: string;
  hueName?: string;
  status?: string;
  colourSource?: string;
  mode?: string;
}

export type Catalog = Record<string, CatalogShade[]>;

export interface AnalyzeResult {
  quadrant?: { code?: string; technicalName?: string; displayName?: string | null; provisional?: boolean };
  labels?: { undertone?: string; value?: string; chroma?: string; seasonEquivalents?: string[]; seasonsProvisional?: boolean };
  foundationBand?: string;
  flags?: string[];
  qualityFailed?: string[];
  recommendations?: Record<string, Omit<CatalogShade, 'mode'>[]>;
  catalog?: Catalog;
  configVersion?: string;
}

/** The try-on catalog of an analysis; older engines only send recommendations. */
export function catalogOf(result: AnalyzeResult | undefined | null): Catalog {
  if (result?.catalog && typeof result.catalog === 'object') return result.catalog;
  const out: Catalog = {};
  for (const [cat, recs] of Object.entries(result?.recommendations ?? {})) {
    if (Array.isArray(recs)) out[cat] = recs.map((r) => ({ ...r, mode: '' }));
  }
  return out;
}

export const isKept = (s: CatalogShade) => s.status === 'same_quadrant' || s.status === 'complementary';

export const CATEGORY_LABEL: Record<string, string> = {
  complexion: 'Foundation', lip: 'Lipstik', eyeshadow: 'Eyeshadow', eyeliner: 'Eyeliner',
  mascara: 'Maskara', brow: 'Alis', blush: 'Blush On',
};

export const QC_ADVICE: Record<string, string> = {
  tidak_ada_wajah: 'Wajah tidak terlihat. Pastikan seluruh wajah masuk bingkai.',
  wajah_ganda: 'Ada lebih dari satu wajah di foto. Foto sendiri saja.',
  terlalu_gelap: 'Foto terlalu gelap. Cari cahaya yang lebih terang dan rata.',
  terlalu_terang: 'Sebagian wajah terlalu terang. Hindari cahaya langsung atau lampu kilat.',
  cahaya_campuran: 'Cahaya bercampur. Pakai satu sumber cahaya.',
  menoleh: 'Wajah menoleh. Hadapkan wajah lurus ke kamera.',
  mendongak_menunduk: 'Wajah mendongak atau menunduk. Tegakkan kepala.',
  miring: 'Kepala miring. Luruskan kepala.',
  ekspresi: 'Ekspresi wajah kuat. Rilekskan wajah.',
  mata_tertutup: 'Mata tertutup. Buka mata saat foto diambil.',
  tertutup: 'Sebagian wajah tertutup. Buka area wajah.',
  blur: 'Foto buram. Pegang kamera lebih stabil.',
  wajah_kecil: 'Wajah terlalu kecil di foto. Dekatkan wajah ke kamera.',
  wajah_besar: 'Wajah terlalu dekat. Mundur sedikit dari kamera.',
  tidak_di_tengah: 'Wajah tidak di tengah. Posisikan wajah di tengah bingkai.',
};

export const FLAG_TEXT: Record<string, string> = {
  uneven_skin_tone: 'Warna kulit di beberapa titik wajah berbeda cukup jauh; sebaiknya cek dengan foto ulang.',
  chroma_approximated: 'Sebagian perhitungan warna memakai pendekatan.',
  hair_not_used: 'Warna rambut tidak dipakai dalam analisis.',
};
