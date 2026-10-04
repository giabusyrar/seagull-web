'use client';
import { useEffect, useRef, useState } from 'react';
import { call, type CallResult } from '@/lib/http';
import { svcPath } from '@/lib/services';
import { useBrand } from '@/lib/brand';
import { ResponseView } from '@/components/ResponseView';
import { WS_BASE, wsUrl, summarize, type WsEvent } from '@/lib/conversation';

export default function ConversationPage() {
  const brand = useBrand();
  const [surveyCode, setSurveyCode] = useState('');
  const [customerId, setCustomerId] = useState('sim-customer');
  const [session, setSession] = useState<{ id: string; owner: string } | null>(null);
  const [last, setLast] = useState<CallResult | null>(null);
  const [events, setEvents] = useState<WsEvent[]>([]);
  const [text, setText] = useState('');
  const [wsState, setWsState] = useState<'closed' | 'connecting' | 'open'>('closed');
  const ws = useRef<WebSocket | null>(null);

  const gen = useRef(0);
  const detach = () => {
    gen.current++;
    const old = ws.current; if (!old) return;
    old.onopen = old.onclose = old.onmessage = null;
    old.close(); ws.current = null; setWsState('closed');
  };
  useEffect(() => () => detach(), []);

  const owner = () => ({ 'X-Session-Owner': session?.owner ?? '' });
  const push = (e: WsEvent) => setEvents((p) => [...p, e]);

  const create = async () => {
    const r = await call({ url: svcPath('conv', '/conversation/sessions'), init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brand_id: brand.brandId, application_id: brand.applicationId, survey_code: surveyCode, customer_id: customerId }) } });
    setLast(r);
    const j = r.json as { session_id?: string; owner_token?: string } | undefined;
    if (r.ok && j?.session_id && j.owner_token) { detach(); setSession({ id: j.session_id, owner: j.owner_token }); setEvents([]); }
  };
  const get = async () => session && setLast(await call({ url: svcPath('conv', `/conversation/sessions/${session.id}`), init: { method: 'GET', headers: owner() } }));
  const del = async () => {
    if (!session) return;
    detach();
    setLast(await call({ url: svcPath('conv', `/conversation/sessions/${session.id}`), init: { method: 'DELETE', headers: owner() } }));
    setSession(null);
  };
  const photo = async (f: File | undefined) => {
    if (!session || !f) return;
    setLast(await call({ url: svcPath('conv', `/conversation/sessions/${session.id}/photo`), init: { method: 'POST', headers: { ...owner(), 'Content-Type': f.type, 'X-Photo-Filename': f.name }, body: f } }));
  };
  const connect = async () => {
    if (!session) return;
    detach();
    const g = gen.current;
    const r = await call({ url: svcPath('conv', `/conversation/sessions/${session.id}/ws-ticket`), init: { method: 'POST', headers: owner() } });
    if (g !== gen.current) return;
    setLast(r);
    const ticket = (r.json as { ticket?: string } | undefined)?.ticket;
    if (!r.ok || !ticket) return;
    setWsState('connecting');
    const sock = new WebSocket(wsUrl(WS_BASE, session.id, ticket));
    ws.current = sock;
    sock.onopen = () => setWsState('open');
    sock.onclose = (e) => { setWsState('closed'); push({ at: Date.now(), dir: 'in', type: 'close', payload: { code: e.code, reason: e.reason } }); };
    sock.onmessage = (m) => {
      let payload: unknown = m.data;
      try { payload = JSON.parse(String(m.data)); } catch {}
      push({ at: Date.now(), dir: 'in', type: (payload as { type?: string })?.type ?? 'raw', payload });
    };
  };
  const send = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !text.trim()) return;
    const msg = { type: 'text', text };
    ws.current.send(JSON.stringify(msg));
    push({ at: Date.now(), dir: 'out', type: 'text', payload: msg });
    setText('');
  };

  const input = 'rounded border px-2 py-1 text-sm';
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Conversation</h1>
      <section className="space-y-2 rounded-lg border p-3">
        <div className="flex flex-wrap items-center gap-2">
          <input className={input} placeholder="survey_code" value={surveyCode} onChange={(e) => setSurveyCode(e.target.value)} />
          <input className={input} placeholder="customer_id" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
          <button className="rounded bg-zinc-900 px-3 py-1 text-sm text-white" onClick={create}>Create session</button>
          {(!brand.brandId || !brand.applicationId) && <span className="text-xs text-amber-700">pick a brand and application in the top bar</span>}
        </div>
        {session && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <code className="text-xs">{session.id}</code>
            <button className="rounded border px-2" onClick={get}>Get state</button>
            <label className="rounded border px-2">Upload photo<input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => photo(e.target.files?.[0])} /></label>
            <button className="rounded border px-2" onClick={connect} disabled={wsState !== 'closed'}>Connect WS ({wsState})</button>
            <button className="rounded border px-2" onClick={() => ws.current?.send(JSON.stringify({ type: 'close' }))} disabled={wsState !== 'open'}>Close WS</button>
            <button className="rounded border px-2 text-red-700" onClick={del}>Delete session</button>
          </div>
        )}
        {last && <ResponseView key={`${last.url}-${last.ms}`} result={last} />}
      </section>
      {session && (
        <section className="rounded-lg border p-3">
          <div className="max-h-96 space-y-0.5 overflow-auto font-mono text-xs">
            {events.map((e, i) => (
              <div key={i} className={e.dir === 'out' ? 'text-blue-700' : e.type === 'error' ? 'text-red-700' : ''}>
                <span className="text-zinc-400">{new Date(e.at).toLocaleTimeString()} </span>{summarize(e)}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input className={`${input} flex-1`} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="type a message (WS must be open)" />
            <button className="rounded bg-zinc-900 px-3 py-1 text-sm text-white" onClick={send} disabled={wsState !== 'open'}>Send</button>
          </div>
        </section>
      )}
    </div>
  );
}
