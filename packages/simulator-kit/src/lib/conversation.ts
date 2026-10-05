// The conversation engine (seagull-core apps/services/conversation): HTTP
// session calls through the /svc/conv rewrite, and a pure reducer for the
// events its live WebSocket sends.
import { SERVICES, svcPath } from './services';
import type { Brand, BuiltRequest } from './photo';
import { piiFields, type Respondent } from './form';

/**
 * Where the browser opens the live socket. Next's rewrites carry HTTP only,
 * so the socket goes to the engine directly. The default is the engine's
 * local-development address from lib/services (one definition), as ws://;
 * deployments set NEXT_PUBLIC_SIM_CONVERSATION_WS.
 */
export const CONVERSATION_WS_BASE = process.env.NEXT_PUBLIC_SIM_CONVERSATION_WS || SERVICES.conv.defaultUrl.replace(/^http/, 'ws');

/** A session and the form it was opened for (a different form needs a new session). */
export interface ConvSession { id: string; owner: string; survey?: string }

const owner = (s: ConvSession) => ({ 'X-Session-Owner': s.owner });

/** The customer as the conversation engine takes them: details and consent. */
export const customerBody = (who: Respondent) => ({
  ...piiFields(who),
  consent_data_processing: who.consentDataProcessing,
  consent_marketing: who.consentMarketing,
});

/**
 * A dry-run session: the engine saves nothing and tells core not to either,
 * so no customer id is sent. An engine that predates dry-run refuses it
 * (customer_id missing) rather than storing anything.
 */
export function createSession(brand: Brand, surveyCode: string, who: Respondent): BuiltRequest {
  return {
    url: svcPath('conv', '/conversation/sessions'),
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand_id: brand.brandId, application_id: brand.applicationId, survey_code: surveyCode,
        dry_run: true, customer: customerBody(who),
      }),
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
/** `at`: when the turn first appeared (ms since epoch), for the recorded transcript. */
export interface Turn { id: string; speaker: Speaker; text: string; final: boolean; at?: number }
export interface ToolCall { id: string; name: string; phase: string; durationMs?: number }
export interface ProgressState {
  phase?: string;
  answered?: number;
  visibleTotal?: number;
  photo?: 'none' | 'requested' | 'received' | 'declined' | string;
  results?: string[];
  /** Answers the engine holds, by question name; only from engines that send them (see answersSupported). */
  answers?: Record<string, unknown>;
  /** true: nothing from this session is saved. Absent: an engine that predates dry-run, so it is saved. */
  dryRun?: boolean;
  /** The customer's current view as the engine recorded it. */
  view?: Record<string, unknown>;
  /** A returning customer the engine remembers (never in a dry run), and their last answers to offer as suggestions. */
  remembered?: boolean;
  rememberedAnswers?: Record<string, unknown>;
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
const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined);
/** Overridable clock, for tests. */
export let now = () => Date.now();
export const setClock = (fn: () => number) => { now = fn; };

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
          answers: obj(s.answers),
          dryRun: typeof s.dry_run === 'boolean' ? s.dry_run : undefined,
          view: obj(s.view),
          remembered: typeof s.remembered === 'boolean' ? s.remembered : undefined,
          rememberedAnswers: obj(s.remembered_answers),
        },
      };
    }
    case 'transcript': {
      const speaker: Speaker = msg.speaker === 'Customer' ? 'Customer' : 'Advisor';
      const id = str(msg.id) || `${speaker}-${state.turns.length}`;
      const i = state.turns.findIndex((t) => t.id === id);
      const turn: Turn = { id, speaker, text: str(msg.text), final: msg.final !== false, at: i < 0 ? now() : state.turns[i].at };
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

/** What the customer is looking at; the engine turns it into an unspoken note for the advisor. */
export interface View { screen: Screen; question?: string; detail?: string }
/** The simulator's screens as the advisor hears them, one per step. */
export type Screen = 'customer' | 'questionnaire' | 'photo' | 'results';
/** What the customer just did, as the advisor hears it. */
export type Action = 'continue_to_photo' | 'skip_questionnaire' | 'photo_analysed';

export const viewMessage = (v: View) => ({ type: 'view', ...v });
export const actionMessage = (action: Action, question?: string, detail?: string) => ({ type: 'action', action, ...(question ? { question } : {}), ...(detail ? { detail } : {}) });

/** The customer message that tells an older engine about a form edit. */
export function answerAsText(questionTitle: string, display: string, lang: 'en' | 'id'): string {
  return lang === 'id' ? `(Saya isi di form) ${questionTitle}: ${display}` : `(Filled in on the form) ${questionTitle}: ${display}`;
}

export interface TranscriptMeta { sessionId?: string; survey?: string; brandId: string; applicationId: string; customer?: string; persona?: string }

/** The conversation as plain text: one line per turn, oldest first. */
export function transcriptText(state: LiveState, meta: TranscriptMeta): string {
  const head = [
    `Session: ${meta.sessionId ?? '-'}`,
    `Form: ${meta.survey ?? '-'}  Brand: ${meta.brandId || '-'} / ${meta.applicationId || '-'}`,
    meta.customer ? `Customer: ${meta.customer}` : '',
    meta.persona ? `Advisor: ${meta.persona}` : '',
  ].filter(Boolean);
  const lines = state.turns
    .filter((t) => t.final && t.text)
    .map((t) => `[${t.at ? new Date(t.at).toISOString() : '-'}] ${t.speaker === 'Customer' ? meta.customer || 'Customer' : meta.persona || 'Advisor'}: ${t.text}`);
  return `${[...head, '', ...lines].join('\n')}\n`;
}

/** The conversation as JSON: turns, the answers and which results arrived. */
export function transcriptJson(state: LiveState, meta: TranscriptMeta): string {
  return JSON.stringify({
    ...meta,
    exportedAt: new Date(now()).toISOString(),
    turns: state.turns.filter((t) => t.final && t.text).map(({ speaker, text, at }) => ({ speaker, text, at: at ? new Date(at).toISOString() : null })),
    answers: state.progress.answers ?? null,
    results: state.results,
  }, null, 2);
}

