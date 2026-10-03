export type Locale = 'id' | 'en';
export type Messages = Record<string, string>;

// Copy shipped with the SDK. Phases 2–5 add their experience's keys here
// (and engine error codes as errors.<engine>.<code>). Brands override any key
// through <BeautyProvider messages>.
export const defaultMessages: Record<Locale, Messages> = {
  id: {
    'photo.front': 'Depan',
    'photo.left': 'Kiri ¾',
    'photo.right': 'Kanan ¾',
    'photo.left.hint': 'Menoleh ke kirimu',
    'photo.right.hint': 'Menoleh ke kananmu',
    'photo.add': 'Tambah foto {view}',
    'photo.change': 'Ganti foto {view}',
    'photo.remove': 'Hapus foto {view}',
    'photo.optional': 'opsional',
    'photo.sides.title': 'Foto samping (opsional)',
    'photo.sides.why': 'untuk kepala 3D yang lebih akurat',
    'photo.sides.guide': 'Wajah menoleh sebagian (tiga perempat), bukan profil penuh; cahaya dan jarak sama dengan foto depan.',
  },
  en: {
    'photo.front': 'Front',
    'photo.left': 'Left ¾',
    'photo.right': 'Right ¾',
    'photo.left.hint': 'Turn to your left',
    'photo.right.hint': 'Turn to your right',
    'photo.add': 'Add {view} photo',
    'photo.change': 'Replace {view} photo',
    'photo.remove': 'Remove {view} photo',
    'photo.optional': 'optional',
    'photo.sides.title': 'Side photos (optional)',
    'photo.sides.why': 'for a more accurate 3D head',
    'photo.sides.guide': 'Face turned part-way (three-quarter), not full profile; same light and distance as the front photo.',
  },
};

export function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (all, k: string) => (Object.hasOwn(vars, k) ? String(vars[k]) : all));
}
