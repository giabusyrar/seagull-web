import { describe, it, expect } from 'vitest';
import { wsUrl, summarize } from '@/lib/conversation';

describe('conversation helpers', () => {
  it('builds the ws url', () => {
    expect(wsUrl('ws://localhost:8098/', 's 1', 't&k')).toBe('ws://localhost:8098/conversation/ws?session_id=s+1&ticket=t%26k');
  });
  it('summarizes transcript, tool, error and audio', () => {
    expect(summarize({ at: 0, dir: 'in', type: 'transcript', payload: { type: 'transcript', speaker: 'agent', text: 'hi', final: true } })).toBe('agent: hi');
    expect(summarize({ at: 0, dir: 'in', type: 'tool', payload: { type: 'tool', name: 'submit', phase: 'end', duration_ms: 12 } })).toBe('tool submit end (12 ms)');
    expect(summarize({ at: 0, dir: 'in', type: 'error', payload: { type: 'error', message: 'boom', fatal: true } })).toBe('error (fatal): boom');
    expect(summarize({ at: 0, dir: 'in', type: 'audio', payload: { type: 'audio', data: 'xxxx' } })).toBe('audio chunk (4 b64 chars)');
  });
});
