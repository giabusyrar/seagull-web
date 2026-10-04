// The conversation engine (seagull-core apps/services/conversation): HTTP
// session calls through the /svc/conv rewrite, and a pure reducer for the
// events its live WebSocket sends.
import { svcPath } from './services';
import type { Brand, BuiltRequest } from './photo';

/**
 * Where the browser opens the live socket. Next's rewrites carry HTTP only,
 * so the socket goes to the engine directly. The default is the engine's
 * local-development port; deployments set NEXT_PUBLIC_SIM_CONVERSATION_WS.
 */
export const CONVERSATION_WS_BASE = process.env.NEXT_PUBLIC_SIM_CONVERSATION_WS || 'ws://localhost:8098';

/** A session and the form it was opened for (a different form needs a new session). */
export interface ConvSession { id: string; owner: string; survey?: string }

const owner = (s: ConvSession) => ({ 'X-Session-Owner': s.owner });

export function createSession(brand: Brand, surveyCode: string, customerId: string): BuiltRequest {
  return {
    url: svcPath('conv', '/conversation/sessions'),
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_id: brand.brandId, application_id: brand.applicationId, survey_code: surveyCode, customer_id: customerId }),
    },
  };
}

/** The scope's conversation flows (core-engine): a survey can be held as a conversation only when it has an active one. */
export function listFlows(brand: Brand): BuiltRequest {
  return {
    url: svcPath('core', `/core/conversation-flows?brand_id=${encodeURIComponent(brand.brandId)}&application_id=${encodeURIComponent(brand.applicationId)}`),
    init: { method: 'GET', cache: 'no-store' },
  };
}

/** Survey codes with an active flow. */
export function activeFlowSurveys(json: unknown): Set<string> {
  const flows = (json as { flows?: unknown })?.flows;
  return new Set(
    (Array.isArray(flows) ? flows : [])
      .filter((f): f is { survey_code: string; status?: string } => !!f && typeof (f as { survey_code?: unknown }).survey_code === 'string')
      .filter((f) => (f.status ?? 'active') === 'active')
      .map((f) => f.survey_code),
  );
}

/** The engine's reason for a refused request ({detail}), else the status. */
export function refusal(json: unknown, status: number): string {
  const d = (json as { detail?: unknown })?.detail;
  if (typeof d === 'string' && d) return d;
  if (Array.isArray(d)) return d.map((x) => (x as { msg?: string })?.msg ?? JSON.stringify(x)).join('; ');
  return `HTTP ${status || 'ERR'}`;
}

export const wsTicket = (s: ConvSession): BuiltRequest => ({ url: svcPath('conv', `/conversation/sessions/${s.id}/ws-ticket`), init: { method: 'POST', headers: owner(s) } });
export const deleteSession = (s: ConvSession): BuiltRequest => ({ url: svcPath('conv', `/conversation/sessions/${s.id}`), init: { method: 'DELETE', headers: owner(s) } });

/** The photo the advisor asked for, as the raw image body. */
export function uploadPhoto(s: ConvSession, photo: File): BuiltRequest {
  return {
    url: svcPath('conv', `/conversation/sessions/${s.id}/photo`),
    init: { method: 'POST', headers: { ...owner(s), 'Content-Type': photo.type || 'image/jpeg', 'X-Photo-Filename': photo.name || 'photo.jpg' }, body: photo },
  };
}

export const cancelPhoto = (s: ConvSession): BuiltRequest => ({ url: svcPath('conv', `/conversation/sessions/${s.id}/photo/cancel`), init: { method: 'POST', headers: owner(s) } });

export function wsUrl(base: string, sessionId: string, ticket: string): string {
  return `${base.replace(/\/+$/, '')}/conversation/ws?${new URLSearchParams({ session_id: sessionId, ticket })}`;
}

// ---- live events -----------------------------------------------------------

export type Speaker = 'Customer' | 'Advisor';
export interface Turn { id: string; speaker: Speaker; text: string; final: boolean }
export interface ToolCall { id: string; name: string; phase: string; durationMs?: number }
export interface ProgressState {
  phase?: string;
  answered?: number;
  visibleTotal?: number;
  photo?: 'none' | 'requested' | 'received' | 'declined' | string;
  results?: string[];
  /** Answers the engine holds, by question name; only from engines that send them (see answersSupported). */
  answers?: Record<string, unknown>;
}

export interface LiveState {
  persona?: string;
  turns: Turn[];
  tools: ToolCall[];
  progress: ProgressState;
  /** Raw result per engine (score, colour, face, vision, match), as the engine sent it. */
  results: Record<string, unknown>;
  errors: string[];
  fatal: boolean;
}

export const INITIAL_LIVE: LiveState = { turns: [], tools: [], progress: {}, results: {}, errors: [], fatal: false };

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/**
 * Folds one server message into the view state. Transcripts arrive as
 * partial turns (final: false) that are replaced in place by id, then a
 * final one. Unknown message types leave the state unchanged.
 */
export function reduceLive(state: LiveState, msg: Record<string, unknown>): LiveState {
  switch (msg.type) {
    case 'session':
      return { ...state, persona: str(msg.persona) || state.persona };
    case 'state': {
      const s = (msg.state ?? {}) as Record<string, unknown>;
      return {
        ...state,
        progress: {
          phase: str(s.phase) || undefined,
          answered: typeof s.answered === 'number' ? s.answered : undefined,
          visibleTotal: typeof s.visible_total === 'number' ? s.visible_total : undefined,
          photo: str(s.photo) || undefined,
          results: Array.isArray(s.results) ? s.results.map(String) : undefined,
          answers: s.answers && typeof s.answers === 'object' && !Array.isArray(s.answers) ? (s.answers as Record<string, unknown>) : undefined,
        },
      };
    }
    case 'transcript': {
      const speaker: Speaker = msg.speaker === 'Customer' ? 'Customer' : 'Advisor';
      const id = str(msg.id) || `${speaker}-${state.turns.length}`;
      const turn: Turn = { id, speaker, text: str(msg.text), final: msg.final !== false };
      const i = state.turns.findIndex((t) => t.id === id);
      if (!turn.text && i < 0) return state;
      const turns = i < 0 ? [...state.turns, turn] : state.turns.map((t, j) => (j === i ? turn : t));
      return { ...state, turns };
    }
    case 'tool': {
      const call: ToolCall = { id: str(msg.id), name: str(msg.name), phase: str(msg.phase), durationMs: typeof msg.duration_ms === 'number' ? msg.duration_ms : undefined };
      const i = state.tools.findIndex((t) => t.id === call.id);
      return { ...state, tools: i < 0 ? [...state.tools, call] : state.tools.map((t, j) => (j === i ? call : t)) };
    }
    case 'result':
      return str(msg.engine) ? { ...state, results: { ...state.results, [str(msg.engine)]: msg.result } } : state;
    case 'error':
      return { ...state, errors: [...state.errors, str(msg.message) || 'error'], fatal: state.fatal || msg.fatal === true };
    case 'answer_result':
      // A form answer the engine refused (e.g. not one of the options); accepted ones arrive in `state`.
      return msg.ok === false ? { ...state, errors: [...state.errors, `${str(msg.question)}: ${str(msg.error) || 'rejected'}`] } : state;
    default:
      return state;
  }
}

/**
 * Whether the advisor is waiting for a photo. The engine reports
 * photo: "requested" only in a `state` it sends after a tool finishes, and
 * request_photo does not finish until a photo (or a decline) arrives, so a
 * running request_photo call is the signal that counts.
 */
export function photoRequested(state: LiveState): boolean {
  const { photo } = state.progress;
  if (photo === 'requested') return true;
  if (photo === 'received' || photo === 'declined') return false;
  return state.tools.some((t) => t.name === 'request_photo' && t.phase === 'running');
}

/**
 * Whether the engine exchanges answers with the client: it then lists them in
 * `state` and accepts `{type: "answer"}`. Older engines do neither, and a form
 * edit is told to the advisor as a customer message instead.
 */
export const answersSupported = (state: LiveState) => state.progress.answers !== undefined;

/** The customer message that tells an older engine about a form edit. */
export function answerAsText(questionTitle: string, display: string, lang: 'en' | 'id'): string {
  return lang === 'id' ? `(Saya isi di form) ${questionTitle}: ${display}` : `(Filled in on the form) ${questionTitle}: ${display}`;
}

