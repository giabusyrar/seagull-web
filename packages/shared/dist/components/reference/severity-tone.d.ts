export type SeverityTone = 'good' | 'warning' | 'bad' | 'neutral';
export declare const SEVERITY_TONES: Readonly<Record<string, SeverityTone>>;
export declare function severityToneOf(severity: unknown): SeverityTone;
