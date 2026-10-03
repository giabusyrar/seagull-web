import { describe, expect, it } from 'vitest';
import { BeautyApiError, parseApiError } from './errors';

const res = (status: number, body: string) => new Response(body, { status });

describe('parseApiError', () => {
  it('reads core detail objects (face architecture style)', async () => {
    const e = await parseApiError(res(422, JSON.stringify({ detail: { code: 'wrong_side', view: 'left' } })));
    expect(e).toBeInstanceOf(BeautyApiError);
    expect(e.status).toBe(422);
    expect(e.code).toBe('wrong_side');
    expect(e.details).toEqual([{ code: 'wrong_side', view: 'left' }]);
  });

  it('keeps every entry of a detail list (multi-gate rejection)', async () => {
    const e = await parseApiError(res(422, JSON.stringify({ detail: [{ code: 'roll', reason: 'tilted' }, { code: 'yaw' }] })));
    expect(e.code).toBe('roll');
    expect(e.message).toBe('tilted');
    expect(e.details).toHaveLength(2);
  });

  it('reads top-level code/error bodies (colour engine style)', async () => {
    const e = await parseApiError(res(400, JSON.stringify({ code: 'no_face', error: 'Wajah tidak terdeteksi' })));
    expect(e.code).toBe('no_face');
    expect(e.message).toBe('Wajah tidak terdeteksi');
  });

  it('keeps a non-JSON body as the message and claims no code', async () => {
    const e = await parseApiError(res(502, 'Bad Gateway'));
    expect(e.code).toBe('');
    expect(e.message).toBe('Bad Gateway');
    expect(e.details).toEqual([]);
  });

  it('reads core Go bodies: error_code, error and the errors list', async () => {
    const e = await parseApiError(res(422, JSON.stringify({ success: false, error: 'validation failed', error_code: 'VALIDATION_FAILED', errors: ['customer_id is required', 'answers is empty'] })));
    expect(e.code).toBe('VALIDATION_FAILED');
    expect(e.message).toBe('validation failed');
    expect(e.details).toEqual([{ message: 'customer_id is required' }, { message: 'answers is empty' }]);
  });

  it('keeps the message of a FastAPI string detail', async () => {
    const e = await parseApiError(res(404, JSON.stringify({ detail: 'Not Found' })));
    expect(e.message).toBe('Not Found');
    expect(e.code).toBe('');
    expect(e.details).toEqual([]);
  });
});
