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
 * The engines answer errors in four shapes, all read into one BeautyApiError:
 * - `{ detail: {...} | [...] }`  vision, face architecture, head (code and
 *   reason/message come from the first entry; every entry is kept as details);
 * - `{ detail: "text" }`  FastAPI's plain errors (the text is the message);
 * - `{ code, error | message }`  colour;
 * - `{ success, error, error_code, errors: string[] }`  core-engine's Go
 *   envelope (error_code is the code, error the message, each `errors` entry a
 *   `{ message }` detail).
 * A body that is not JSON stays the message, with no code claimed.
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
  if (!details.length && Array.isArray(b.errors)) {
    for (const m of b.errors) if (typeof m === 'string') details.push({ message: m });
  }
  return new BeautyApiError({
    status: res.status,
    code: str(first.code) || str(b.code) || str(b.error_code),
    message: str(first.reason) || str(first.message) || str(b.error) || str(b.message) || str(detail),
    details,
  });
}
