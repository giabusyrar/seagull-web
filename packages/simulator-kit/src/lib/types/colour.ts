import type { Bilingual } from '../i18n';
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

export const CATEGORY_LABEL: Bilingual = {
  en: { complexion: 'Foundation', lip: 'Lipstick', eyeshadow: 'Eyeshadow', eyeliner: 'Eyeliner', mascara: 'Mascara', brow: 'Brow', blush: 'Blush' },
  id: { complexion: 'Foundation', lip: 'Lipstik', eyeshadow: 'Eyeshadow', eyeliner: 'Eyeliner', mascara: 'Maskara', brow: 'Alis', blush: 'Blush On' },
};

/** What to change for a retake, per quality check the colour engine failed (its codes are Indonesian words). */
export const QC_ADVICE: Bilingual = {
  en: {
    tidak_ada_wajah: 'No face visible. Make sure the whole face is in frame.',
    wajah_ganda: 'More than one face in the photo. Take it alone.',
    terlalu_gelap: 'The photo is too dark. Find brighter, even light.',
    terlalu_terang: 'Part of the face is overexposed. Avoid direct light or flash.',
    cahaya_campuran: 'Mixed lighting. Use a single light source.',
    menoleh: 'The face is turned. Face the camera straight on.',
    mendongak_menunduk: 'The head is tilted up or down. Hold it level.',
    miring: 'The head is tilted sideways. Straighten it.',
    ekspresi: 'Strong facial expression. Relax the face.',
    mata_tertutup: 'Eyes are closed. Keep them open for the photo.',
    tertutup: 'Part of the face is covered. Uncover it.',
    blur: 'The photo is blurry. Hold the camera steadier.',
    wajah_kecil: 'The face is too small. Move closer to the camera.',
    wajah_besar: 'The face is too close. Step back a little.',
    tidak_di_tengah: 'The face is off-centre. Centre it in the frame.',
  },
  id: {
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
  },
};

export const FLAG_TEXT: Bilingual = {
  en: {
    uneven_skin_tone: 'Skin colour differs noticeably across the face; worth checking with a retake.',
    chroma_approximated: 'Part of the colour calculation is approximated.',
    hair_not_used: 'Hair colour was not used in the analysis.',
  },
  id: {
    uneven_skin_tone: 'Warna kulit di beberapa titik wajah berbeda cukup jauh; sebaiknya cek dengan foto ulang.',
    chroma_approximated: 'Sebagian perhitungan warna memakai pendekatan.',
    hair_not_used: 'Warna rambut tidak dipakai dalam analisis.',
  },
};
