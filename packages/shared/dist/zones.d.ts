export declare const FACIAL_ZONES: readonly [{
    readonly code: "ZONE_FOREHEAD";
    readonly label: "Forehead";
}, {
    readonly code: "ZONE_T_ZONE_NOSE";
    readonly label: "T-Zone & Nose";
}, {
    readonly code: "ZONE_LEFT_CHEEK_INNER";
    readonly label: "Left Cheek (Inner)";
}, {
    readonly code: "ZONE_LEFT_CHEEK_OUTER";
    readonly label: "Left Cheek (Outer)";
}, {
    readonly code: "ZONE_RIGHT_CHEEK_INNER";
    readonly label: "Right Cheek (Inner)";
}, {
    readonly code: "ZONE_RIGHT_CHEEK_OUTER";
    readonly label: "Right Cheek (Outer)";
}, {
    readonly code: "ZONE_PERIORBITAL_EYELIDS";
    readonly label: "Periorbital & Eyelids";
}, {
    readonly code: "ZONE_CHIN_JAWLINE";
    readonly label: "Chin & Jawline";
}];
export type FacialZoneCode = (typeof FACIAL_ZONES)[number]['code'];
export type MakeupRegion = 'skin' | 'cheek' | 'eye' | 'lip';
export declare const ZONE_TO_MAKEUP_REGION: Record<MakeupRegion, readonly FacialZoneCode[]>;
