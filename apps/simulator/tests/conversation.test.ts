import { describe, it, expect } from 'vitest';
import { INITIAL_LIVE, activeFlowSurveys, answerAsText, answersSupported, createSession, photoRequested, reduceLive, refusal, uploadPhoto, wsTicket, wsUrl } from '@/lib/conversation';
import { base64ToPcm16, bytesToBase64, floatToPcm16, pcm16ToFloat, rateOf } from '@/lib/audio';

const s = { id: 'sess1', owner: 'own1' };

describe('conversation requests', () => {
  it('creates a session with the scope, survey and customer', () => {
    const { url, init } = createSession({ brandId: 'WARDAH', applicationId: 'skinverse' }, 'q1', 'sim-customer');
    expect(url).toBe('/svc/conv/conversation/sessions');
    expect(JSON.parse(init.body as string)).toEqual({ brand_id: 'WARDAH', application_id: 'skinverse', survey_code: 'q1', customer_id: 'sim-customer' });
  });

  it('sends the owner token on session calls and the raw photo body', () => {
    expect(wsTicket(s).init.headers).toEqual({ 'X-Session-Owner': 'own1' });
    const photo = new File([new Uint8Array([1])], 'f.png', { type: 'image/png' });
    const { url, init } = uploadPhoto(s, photo);
    expect(url).toBe('/svc/conv/conversation/sessions/sess1/photo');
    expect(init.headers).toEqual({ 'X-Session-Owner': 'own1', 'Content-Type': 'image/png', 'X-Photo-Filename': 'f.png' });
    expect(init.body).toBe(photo);
  });

  it('builds the socket URL with session and ticket', () => {
    expect(wsUrl('ws://h:8098/', 'sess1', 't k')).toBe('ws://h:8098/conversation/ws?session_id=sess1&ticket=t+k');
  });
});

describe('reduceLive', () => {
  it('replaces a partial turn in place and keeps order', () => {
    let st = reduceLive(INITIAL_LIVE, { type: 'transcript', speaker: 'Advisor', id: 'a1', text: 'Hal', final: false });
    st = reduceLive(st, { type: 'transcript', speaker: 'Customer', id: 'c1', text: 'Hi', final: true });
    st = reduceLive(st, { type: 'transcript', speaker: 'Advisor', id: 'a1', text: 'Halo!', final: true });
    expect(st.turns).toEqual([
      { id: 'a1', speaker: 'Advisor', text: 'Halo!', final: true },
      { id: 'c1', speaker: 'Customer', text: 'Hi', final: true },
    ]);
  });

  it('reads progress, results per engine and errors', () => {
    let st = reduceLive(INITIAL_LIVE, { type: 'state', state: { phase: 'form', answered: 2, visible_total: 6, photo: 'requested', results: [] } });
    expect(st.progress).toEqual({ phase: 'form', answered: 2, visibleTotal: 6, photo: 'requested', results: [] });
    st = reduceLive(st, { type: 'result', engine: 'score', result: { total_score: 1 } });
    st = reduceLive(st, { type: 'error', message: 'boom', fatal: true });
    expect(st.results).toEqual({ score: { total_score: 1 } });
    expect(st.errors).toEqual(['boom']);
    expect(st.fatal).toBe(true);
  });

  it('tracks tool calls by id and ignores unknown messages', () => {
    let st = reduceLive(INITIAL_LIVE, { type: 'tool', id: 't1', name: 'submit', phase: 'running' });
    st = reduceLive(st, { type: 'tool', id: 't1', name: 'submit', phase: 'done', duration_ms: 40 });
    expect(st.tools).toEqual([{ id: 't1', name: 'submit', phase: 'done', durationMs: 40 }]);
    expect(reduceLive(st, { type: 'mystery' })).toBe(st);
  });
});

describe('audio', () => {
  it('downsamples 48 kHz to 16 kHz PCM16 and clamps', () => {
    const pcm = floatToPcm16(new Float32Array([1, 1, 1, -1, -1, -1, 2, 2, 2]), 48000, 16000);
    expect(Array.from(pcm)).toEqual([32767, -32768, 32767]);
  });

  it('round-trips PCM16 through base64 little-endian', () => {
    const pcm = new Int16Array([0, 1, -1, 32767, -32768]);
    const back = base64ToPcm16(bytesToBase64(new Uint8Array(pcm.buffer)));
    expect(Array.from(back)).toEqual(Array.from(pcm));
    expect(pcm16ToFloat(new Int16Array([-32768, 32767]))[0]).toBe(-1);
  });

  it('reads the rate from the MIME type and does not guess one', () => {
    expect(rateOf('audio/pcm;rate=24000')).toBe(24000);
    expect(rateOf('audio/pcm')).toBeNull();
    expect(rateOf(undefined)).toBeNull();
  });
});

describe('photoRequested', () => {
  it('counts a running request_photo call, since its state only arrives once it finishes', () => {
    const running = reduceLive(INITIAL_LIVE, { type: 'tool', id: 'p1', name: 'request_photo', phase: 'running' });
    expect(photoRequested(running)).toBe(true);
    expect(photoRequested(reduceLive(running, { type: 'tool', id: 'p1', name: 'request_photo', phase: 'done' }))).toBe(false);
    expect(photoRequested(reduceLive(running, { type: 'state', state: { photo: 'received' } }))).toBe(false);
    expect(photoRequested(reduceLive(INITIAL_LIVE, { type: 'state', state: { photo: 'requested' } }))).toBe(true);
    expect(photoRequested(INITIAL_LIVE)).toBe(false);
  });
});

describe('flows and refusals', () => {
  it('keeps only surveys with an active flow', () => {
    const codes = activeFlowSurveys({ flows: [{ survey_code: 'a', status: 'active' }, { survey_code: 'b', status: 'draft' }, { survey_code: 'c' }, { nope: 1 }] });
    expect([...codes].sort()).toEqual(['a', 'c']);
    expect(activeFlowSurveys({ error: 'x' }).size).toBe(0);
  });

  it('reads the engine reason, else the status', () => {
    expect(refusal({ detail: 'conversation flow not found' }, 404)).toBe('conversation flow not found');
    expect(refusal({ detail: [{ msg: 'field required' }] }, 422)).toBe('field required');
    expect(refusal(null, 0)).toBe('HTTP ERR');
  });
});

describe('answer sync', () => {
  it('reads answers from state, which marks the engine as answer-capable', () => {
    expect(answersSupported(INITIAL_LIVE)).toBe(false);
    const st = reduceLive(INITIAL_LIVE, { type: 'state', state: { answered: 1, visible_total: 6, answers: { Q1_DO: ['g'] } } });
    expect(st.progress.answers).toEqual({ Q1_DO: ['g'] });
    expect(answersSupported(st)).toBe(true);
    expect(answersSupported(reduceLive(INITIAL_LIVE, { type: 'state', state: { answers: {} } }))).toBe(true);
  });

  it('surfaces a refused form answer and ignores accepted ones', () => {
    expect(reduceLive(INITIAL_LIVE, { type: 'answer_result', question: 'Q3', ok: false, error: 'not an option' }).errors).toEqual(['Q3: not an option']);
    expect(reduceLive(INITIAL_LIVE, { type: 'answer_result', question: 'Q3', ok: true })).toBe(INITIAL_LIVE);
  });

  it('words the fallback message in the UI language', () => {
    expect(answerAsText('Q1', 'a, b', 'en')).toBe('(Filled in on the form) Q1: a, b');
    expect(answerAsText('Q1', 'a, b', 'id')).toBe('(Saya isi di form) Q1: a, b');
  });
});
