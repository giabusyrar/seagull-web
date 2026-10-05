'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePersistentState } from '@gateway-experience/shared';
import { call, type CallResult } from '@/lib/http';
import type { Brand } from '@/lib/photo';
import {
  CONVERSATION_WS_BASE, INITIAL_LIVE, actionMessage, answersSupported, cancelPhoto, refusal, createSession, deleteSession, reduceLive, uploadPhoto, viewMessage, wsTicket, wsUrl,
  type Action, type ConvSession, type LiveState, type View,
} from '@/lib/conversation';
import type { Respondent } from '@/lib/form';
import { MicStream, Player } from './audio-io';
import { useLang } from '@/lib/i18n';

/** WebSocket close codes for an ordinary close (RFC 6455 §7.4.1): not an error to show. */
const WS_NORMAL_CLOSURE = 1000;
const WS_NO_STATUS_RECEIVED = 1005;

/**
 * How long after sending a view/action note an "Unknown message type." error
 * is taken as the engine's answer to that note (an engine that predates
 * them), rather than a problem to show the customer.
 */
const NOTE_REPLY_WINDOW_MS = 3000;

/**
 * One conversation session and its live socket. The session (id + owner
 * token) and what was said survive a reload in localStorage, so the page can
 * reconnect to the same session; the engine keeps the session server-side
 * until it expires, after which reconnecting reports it.
 */
export function useLiveConversation() {
  const { t } = useLang();
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);
  const [session, setSession] = usePersistentState<ConvSession | null>('sim.conv.session', null);
  // What was said, progress and results persist; whether the socket is open does not.
  const [live, setLive] = usePersistentState<LiveState>('sim.conv.live', INITIAL_LIVE);
  const [conn, setConn] = useState<'idle' | 'connecting' | 'ready' | 'closed'>('idle');
  const [lastHttp, setLastHttp] = useState<CallResult | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [level, setLevel] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const mic = useRef<MicStream | null>(null);
  const player = useRef<Player | null>(null);
  const gen = useRef(0);
  /** null: not tried on this connection; false: the engine does not know `view`/`action`, so stop sending them. */
  const notesSupported = useRef<boolean | null>(null);
  const lastNoteAt = useRef(0);
  /** The customer's current view, re-sent on every connect so a new socket knows where they are. */
  const view = useRef<View | null>(null);
  const liveRef = useRef(live);
  const connectRef = useRef<((s: ConvSession) => Promise<void>) | null>(null);
  /** Where in the transcript the current connection resumed, or null for a fresh session. */
  const [resumeIndex, setResumeIndex] = useState<number | null>(null);
  useEffect(() => { liveRef.current = live; }, [live]);

  const apply = useCallback((msg: Record<string, unknown>) => {
    if (msg.type === 'ready') {
      setConn('ready');
      if (view.current) sendNote(viewMessage(view.current));
    }
    setLive((s) => reduceLive(s, msg));
  }, [setLive]);

  const stopMic = useCallback((sendEnd = true) => {
    mic.current?.stop();
    mic.current = null;
    setMicOn(false);
    setLevel(0);
    if (sendEnd && ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: 'audio_end' }));
  }, []);

  const detach = useCallback(() => {
    gen.current++;
    stopMic(false);
    player.current?.close();
    player.current = null;
    const old = ws.current;
    if (old) { old.onopen = old.onclose = old.onmessage = old.onerror = null; old.close(); }
    ws.current = null;
    setConn((c) => (c === 'idle' ? c : 'closed'));
  }, [stopMic]);

  useEffect(() => () => detach(), [detach]);

  const connect = useCallback(async (s: ConvSession) => {
    detach();
    const g = gen.current;
    setConn('connecting');
    // Tool calls belong to one connection: the engine cancels them when a socket closes.
    setLive((st) => ({ ...st, tools: [], errors: [], fatal: false }));
    // The engine seeds Gemini with the session's transcript on every connect,
    // so a reconnect continues the same conversation; mark where it resumed.
    const said = liveRef.current.turns.length;
    setResumeIndex(said > 0 ? said : null);
    const r = await call(wsTicket(s));
    if (g !== gen.current) return;
    setLastHttp(r);
    const ticket = (r.json as { ticket?: string } | undefined)?.ticket;
    if (!r.ok || !ticket) {
      setConn('closed');
      setLive((st) => ({ ...st, errors: [...st.errors, r.status === 404 ? tRef.current('The session has ended on the server. Start a new one.', 'Sesi sudah berakhir di server. Mulai sesi baru.') : `${tRef.current('Ticket failed', 'Tiket gagal')} (HTTP ${r.status || 'ERR'}).`] }));
      if (r.status === 404) setSession(null);
      return;
    }
    player.current = new Player(setSpeaking);
    const sock = new WebSocket(wsUrl(CONVERSATION_WS_BASE, s.id, ticket));
    ws.current = sock;
    notesSupported.current = null;
    // Gemini ends long live connections (go_away); the engine then asks for a reconnect and closes.
    let reconnectAsked = false;
    sock.onclose = (e) => {
      if (g !== gen.current) return;
      if (reconnectAsked) { void connectRef.current?.(s); return; }
      stopMic(false);
      setConn('closed');
      setLive((st) => ({ ...st, errors: e.code === WS_NORMAL_CLOSURE || e.code === WS_NO_STATUS_RECEIVED ? st.errors : [...st.errors, `${tRef.current('Connection closed', 'Koneksi ditutup')} (${e.code}${e.reason ? `: ${e.reason}` : ''}).`] }));
    };
    sock.onmessage = (m) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(String(m.data)); } catch { return; }
      if (msg.type === 'audio') {
        const err = player.current?.play(String(msg.data ?? ''), typeof msg.mime_type === 'string' ? msg.mime_type : undefined);
        if (err) apply({ type: 'error', message: err });
        return;
      }
      if (msg.type === 'interrupted') { player.current?.interrupt(); return; }
      if (msg.type === 'reconnect') { reconnectAsked = true; return; }
      // An engine without `view`/`action` answers them with this error; that is not the customer's problem.
      if (msg.type === 'error' && msg.message === 'Unknown message type.' && Date.now() - lastNoteAt.current < NOTE_REPLY_WINDOW_MS) {
        notesSupported.current = false;
        return;
      }
      apply(msg);
    };
  }, [apply, detach, setLive, setSession, stopMic]);
  useEffect(() => { connectRef.current = connect; }, [connect]);

  /** Starts a dry-run session for the customer (see createSession). */
  const start = useCallback(async (brand: Brand, surveyCode: string, who: Respondent) => {
    detach();
    if (session) {
      // The old session is gone either way; never leave it saved as resumable.
      void call(deleteSession(session));
      setSession(null);
    }
    const r = await call(createSession(brand, surveyCode, who));
    setLastHttp(r);
    const j = r.json as { session_id?: string; owner_token?: string } | undefined;
    if (!r.ok || !j?.session_id || !j.owner_token) {
      setConn('closed');
      const why = refusal(r.json, r.status);
      setLive({ ...INITIAL_LIVE, errors: [why === 'conversation flow not found' ? tRef.current('This form has no active conversation flow.', 'Form ini belum punya alur percakapan aktif.') : `${tRef.current('Session not created', 'Sesi tidak dibuat')}: ${why}.`] });
      return;
    }
    const s = { id: j.session_id, owner: j.owner_token, survey: surveyCode };
    setSession(s);
    setLive(INITIAL_LIVE);
    liveRef.current = INITIAL_LIVE;
    await connect(s);
  }, [connect, detach, session, setLive, setSession]);

  /**
   * Pause: the socket closes ('close' lets the engine finish the turns in
   * flight) but the session stays open on the server, so play reconnects to
   * the same conversation, answers and progress.
   */
  const pause = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: 'close' }));
    detach();
  }, [detach]);

  const end = useCallback(async () => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: 'close' }));
    detach();
    if (session) setLastHttp(await call(deleteSession(session)));
    setSession(null);
  }, [detach, session, setSession]);

  /**
   * A form edit: as an `answer` message where the engine supports it (it
   * records it and tells the model), else as the customer's own words.
   */
  const sendAnswer = useCallback((question: string, value: unknown, fallbackText: string) => {
    const sock = ws.current;
    if (!sock || sock.readyState !== WebSocket.OPEN) return false;
    if (answersSupported(liveRef.current)) sock.send(JSON.stringify({ type: 'answer', question, value }));
    else sock.send(JSON.stringify({ type: 'text', text: fallbackText }));
    return true;
  }, []);

  /**
   * What the customer is looking at (sendView) and what they just did
   * (sendAction): unspoken notes the advisor follows. The view is kept and
   * re-sent on each connect; the engine drops an identical repeat.
   */
  const sendView = useCallback((v: View) => {
    view.current = v;
    return sendNote(viewMessage(v));
  }, []);
  const sendAction = useCallback((action: Action, question?: string, detail?: string) => sendNote(actionMessage(action, question, detail)), []);

  const sendText = useCallback((text: string) => {
    const t = text.trim();
    if (!t || ws.current?.readyState !== WebSocket.OPEN) return false;
    ws.current.send(JSON.stringify({ type: 'text', text: t }));
    return true;
  }, []);

  const toggleMic = useCallback(async () => {
    if (mic.current) { stopMic(); return; }
    const sock = ws.current;
    if (!sock || sock.readyState !== WebSocket.OPEN) return;
    const m = new MicStream((b64) => { if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: 'audio', data: b64 })); }, setLevel);
    try {
      await m.start();
      mic.current = m;
      setMicOn(true);
    } catch (e) {
      m.stop();
      apply({ type: 'error', message: `${tRef.current('Microphone', 'Mikrofon')}: ${e instanceof Error ? e.message : String(e)}` });
    }
  }, [apply, stopMic]);

  const sendPhoto = useCallback(async (photo: File) => {
    if (!session) return;
    setLastHttp(await call(uploadPhoto(session, photo)));
  }, [session]);

  const declinePhoto = useCallback(async () => {
    if (!session) return;
    setLastHttp(await call(cancelPhoto(session)));
  }, [session]);

  /** Ends the session on the server and forgets it and everything said. */
  const reset = useCallback(async () => {
    detach();
    const s = session;
    setSession(null);
    setConn('idle');
    setLive(INITIAL_LIVE);
    setResumeIndex(null);
    if (s) setLastHttp(await call(deleteSession(s)));
  }, [detach, session, setLive, setSession]);

  return { session, live, conn, resumeIndex, lastHttp, micOn, level, speaking, start, connect, pause, end, sendText, sendAnswer, sendView, sendAction, toggleMic, sendPhoto, declinePhoto, reset };

  function sendNote(msg: Record<string, unknown>) {
    const sock = ws.current;
    if (!sock || sock.readyState !== WebSocket.OPEN || notesSupported.current === false) return false;
    lastNoteAt.current = Date.now();
    sock.send(JSON.stringify(msg));
    return true;
  }
}
