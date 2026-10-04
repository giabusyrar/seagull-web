export type WsEvent = { at: number; dir: 'in' | 'out'; type: string; payload: unknown };

export const WS_BASE = process.env.NEXT_PUBLIC_SIM_CONVERSATION_WS || 'ws://localhost:8098';

export function wsUrl(base: string, sessionId: string, ticket: string) {
  const q = new URLSearchParams({ session_id: sessionId, ticket });
  return `${base.replace(/\/+$/, '')}/conversation/ws?${q}`;
}

export function summarize(e: WsEvent): string {
  const p = (e.payload ?? {}) as Record<string, unknown>;
  switch (e.type) {
    case 'transcript': return `${p.speaker}: ${p.text}${p.final === false ? ' …' : ''}`;
    case 'tool': return `tool ${p.name} ${p.phase}${p.duration_ms !== undefined ? ` (${p.duration_ms} ms)` : ''}`;
    case 'error': return `error${p.fatal ? ' (fatal)' : ''}: ${p.message}`;
    case 'audio': return `audio chunk (${String(p.data ?? '').length} b64 chars)`;
    case 'text': return `you: ${p.text}`;
    default: return JSON.stringify(p);
  }
}
