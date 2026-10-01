import type { Measurement } from './faceTypes';
import { formatMm } from './physicalScale';

// Plain-language names for the face worker's measurement catalogue, so a
// person reads "Lebar dahi: 88% dari lebar wajah" instead of
// "upper_to_mid_width_ratio: 0.88". Written from the definitions in
// Seagull-core apps/workers/face/worker_face/facegeom/measures.py at the
// catalogue version below. A definition change bumps that version, and a
// result from any other version falls back to the raw key and number rather
// than describe a measurement this copy was not written for.
export const MEASUREMENT_COPY_CATALOGUE = 'fa-measure/1';

interface Copy {
  name: string;
  /** For a ratio A/B: what B is, so the value reads as "x% dari <of>". */
  of?: string;
  /** For an angle: what a positive and a negative value mean. */
  positive?: string;
  negative?: string;
}

// Lengths in the catalogue are in IOD: the distance between the eye centres.
const IOD_LONG = 'jarak antar mata';

export const MEASUREMENT_COPY: Record<string, Copy> = {
  face_length_mesh: { name: 'Panjang wajah' },
  face_width_oval: { name: 'Lebar wajah' },
  upper_width_proxy: { name: 'Lebar dahi' },
  jaw_width_proxy: { name: 'Lebar rahang' },
  width_length_ratio: { name: 'Lebar wajah', of: 'panjang wajah' },
  upper_to_mid_width_ratio: { name: 'Lebar dahi', of: 'lebar wajah' },
  jaw_to_mid_width_ratio: { name: 'Lebar rahang', of: 'lebar wajah' },
  jaw_contour_angles: { name: 'Sudut kontur rahang' },
  jaw_taper_angle_deg: { name: 'Sudut runcing rahang' },
  chin_taper: { name: 'Lebar dagu', of: 'lebar rahang' },
  oval_fit_residual: { name: 'Selisih kontur dari elips' },
  thirds_upper_proxy: { name: 'Sepertiga atas (dahi)' },
  thirds_mid: { name: 'Sepertiga tengah (alis–bawah hidung)' },
  thirds_lower: { name: 'Sepertiga bawah (bawah hidung–dagu)' },
  thirds_lower_to_mid_ratio: { name: 'Sepertiga bawah', of: 'sepertiga tengah' },
  lower_face_split: { name: 'Jarak hidung–mulut', of: 'jarak mulut–dagu' },
  fifths: { name: 'Seperlima lebar wajah', of: 'lebar wajah' },
  eye_width: { name: 'Lebar mata' },
  eye_aperture_ratio: { name: 'Tinggi bukaan mata', of: 'lebar mata' },
  canthal_tilt_deg: { name: 'Kemiringan mata', positive: 'ujung luar lebih tinggi', negative: 'ujung luar lebih rendah' },
  intercanthal_ratio: { name: 'Jarak sudut dalam mata', of: 'lebar mata' },
  eye_to_face_width_ratio: { name: 'Lebar mata', of: 'lebar wajah' },
  brow_length: { name: 'Panjang alis' },
  brow_arch_ratio: { name: 'Tinggi lengkung alis', of: 'panjang alis' },
  brow_peak_position: { name: 'Posisi puncak alis', of: 'jalan dari pangkal ke ujung alis' },
  brow_tail_tilt_deg: { name: 'Kemiringan ekor alis', positive: 'ekor menurun', negative: 'ekor naik' },
  brow_band_height: { name: 'Tebal alis' },
  interbrow_ratio: { name: 'Jarak antar alis', of: 'jarak sudut dalam mata' },
  brow_length_to_eye_ratio: { name: 'Panjang alis', of: 'lebar mata' },
  brow_eye_gap: { name: 'Jarak alis–mata' },
  alar_width_to_intercanthal_ratio: { name: 'Lebar cuping hidung', of: 'jarak sudut dalam mata' },
  alar_width_to_mouth_ratio: { name: 'Lebar cuping hidung', of: 'lebar mulut' },
  nose_length_ratio: { name: 'Panjang hidung', of: 'jarak alis–dagu' },
  mouth_width: { name: 'Lebar mulut' },
  upper_lower_lip_ratio: { name: 'Tebal bibir atas', of: 'tebal bibir bawah' },
  lip_fullness_ratio: { name: 'Tebal bibir', of: 'lebar mulut' },
  cupid_bow_depth: { name: "Kedalaman cupid's bow" },
  mouth_corner_tilt_deg: { name: 'Kemiringan sudut bibir', positive: 'sudut bibir turun', negative: 'sudut bibir naik' },
  cheek_widest_height: { name: 'Posisi pipi terlebar', of: 'jalan dari garis mata ke bawah hidung' },
  // Declared but not yet supported by the worker (no definition); named so
  // they read sensibly if a later worker fills them.
  eyelid_type: { name: 'Tipe kelopak mata' },
  brow_density: { name: 'Kepadatan alis' },
  cheekbone_prominence: { name: 'Tonjolan tulang pipi' },
  // Mirrored Procrustes asymmetry (facegeom/symmetry.py): mean left-right
  // mismatch after mirroring, in IOD.
  asymmetry_total: { name: 'Asimetri wajah' },
  asymmetry_eyes: { name: 'Asimetri mata' },
  asymmetry_brows: { name: 'Asimetri alis' },
  asymmetry_nose: { name: 'Asimetri hidung' },
  asymmetry_lips: { name: 'Asimetri bibir' },
  asymmetry_contour: { name: 'Asimetri kontur pipi' },
  asymmetry_jaw: { name: 'Asimetri rahang' },
};

export interface FriendlyValue {
  /** Next to the line on the photo. */
  short: string;
  /** In the list: the value with what it is relative to. */
  long: string;
  /** The worker's noise band in the same terms, when it sent one. */
  band?: string;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;
const times = (v: number) => `${Number(v.toFixed(2))}×`;
const deg = (v: number) => `${Number(v.toFixed(1))}°`;

function copyFor(m: Measurement, catalogueVersion: string): Copy | null {
  return catalogueVersion === MEASUREMENT_COPY_CATALOGUE ? (MEASUREMENT_COPY[m.key] ?? null) : null;
}

export function measurementName(m: Measurement, catalogueVersion: string): string {
  return copyFor(m, catalogueVersion)?.name ?? m.key;
}

/**
 * The value in words a person can read, or null when there is none. With
 * mmPerIod (physicalScale), lengths read in millimetres, marked "≈" because
 * the scale is itself an estimate; ratios and angles have no length to convert.
 */
export function friendlyValue(m: Measurement, catalogueVersion: string, mmPerIod: number | null = null): FriendlyValue | null {
  if (m.value === null) return null;
  const copy = copyFor(m, catalogueVersion);
  const inMm = m.unit === 'iod' && mmPerIod !== null;
  const one = (v: number): string => {
    if (inMm) return `≈${formatMm(v * mmPerIod!)}`;
    if (!copy) return String(Number(v.toFixed(2)));
    if (m.unit === 'iod') return times(v);
    if (m.unit === 'deg') return deg(v);
    return copy.of ? pct(v) : String(Number(v.toFixed(2)));
  };

  if (Array.isArray(m.value)) {
    const short = m.value.map(one).join(' · ');
    return { short, long: copy?.of ? `${short} dari ${copy.of}` : short };
  }

  const v = m.value;
  const short = one(v);
  let long = short;
  if (inMm) long = `${short} (${times(v)} ${IOD_LONG})`;
  else if (copy) {
    if (m.unit === 'iod') long = `${short} ${IOD_LONG}`;
    else if (m.unit === 'deg') {
      const side = v > 0 ? copy.positive : v < 0 ? copy.negative : undefined;
      long = side ? `${short}, ${side}` : short;
    } else if (copy.of) long = `${short} dari ${copy.of}`;
  }
  const band =
    m.band && typeof m.band[0] === 'number' && typeof m.band[1] === 'number' ? `${one(m.band[0])} – ${one(m.band[1])}` : undefined;
  return { short, long, band };
}
