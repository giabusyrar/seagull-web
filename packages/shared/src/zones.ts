// Facial zones produced by the vision segmenter
// (apps/services/vision-ai-worker/app/models/zone_segmenter.py).
export const FACIAL_ZONES = [
  { code: 'ZONE_FOREHEAD', label: 'Forehead' },
  { code: 'ZONE_T_ZONE_NOSE', label: 'T-Zone & Nose' },
  { code: 'ZONE_LEFT_CHEEK_INNER', label: 'Left Cheek (Inner)' },
  { code: 'ZONE_LEFT_CHEEK_OUTER', label: 'Left Cheek (Outer)' },
  { code: 'ZONE_RIGHT_CHEEK_INNER', label: 'Right Cheek (Inner)' },
  { code: 'ZONE_RIGHT_CHEEK_OUTER', label: 'Right Cheek (Outer)' },
  { code: 'ZONE_PERIORBITAL_EYELIDS', label: 'Periorbital & Eyelids' },
  { code: 'ZONE_CHIN_JAWLINE', label: 'Chin & Jawline' },
] as const;

export type FacialZoneCode = (typeof FACIAL_ZONES)[number]['code'];

export type MakeupRegion = 'skin' | 'cheek' | 'eye' | 'lip';

// Facial zones covered by each virtual try-on makeup region. Lips have no
// segmenter zone yet.
export const ZONE_TO_MAKEUP_REGION: Record<MakeupRegion, readonly FacialZoneCode[]> = {
  skin: FACIAL_ZONES.map((zone) => zone.code),
  cheek: ['ZONE_LEFT_CHEEK_INNER', 'ZONE_LEFT_CHEEK_OUTER', 'ZONE_RIGHT_CHEEK_INNER', 'ZONE_RIGHT_CHEEK_OUTER'],
  eye: ['ZONE_PERIORBITAL_EYELIDS'],
  lip: [],
};
