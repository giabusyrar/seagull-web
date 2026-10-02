/** Every failed SDK call, whatever the engine. Nothing is invented: a body
 *  that is not JSON stays the message, and no code is claimed for it. */
export class BeautyApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>[];

  constructor(init: { status: number; code: string; message: string; details: Record<string, unknown>[] }) {
    super(init.message || init.code || `HTTP ${init.status}`);
    this.name = 'BeautyApiError';
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
  }
}

const isEntry = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' ? v : '');

/**
 * Core answers errors in two shapes: `{ detail: {...} | [...] }` (vision,
 * face architecture, head) and `{ code, error | message }` (colour). Both
 * become one BeautyApiError; every detail entry is kept.
 */
export async function parseApiError(res: Response): Promise<BeautyApiError> {
  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return new BeautyApiError({ status: res.status, code: '', message: text, details: [] });
  }
  const b = isEntry(body) ? body : {};
  const detail = b.detail;
  const details = Array.isArray(detail) ? detail.filter(isEntry) : isEntry(detail) ? [detail] : [];
  const first = details[0] ?? {};
  return new BeautyApiError({
    status: res.status,
    code: str(first.code) || str(b.code),
    message: str(first.reason) || str(first.message) || str(b.error) || str(b.message),
    details,
  });
}
