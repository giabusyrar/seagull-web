// Where the simulator's services are, as the HOST app decides. The simulator
// app reaches them through its own /svc/<id> rewrites (its defaults below);
// the dashboard's Simulator Studio points them at its gateway proxy. Every
// request the simulator makes is built from these, so the same screens work
// in both without knowing which host they are in.

export type ServiceId = 'core' | 'ref' | 'conv';

export interface ServiceInfo {
  id: ServiceId;
  label: string;
  /** Health check path on the service, appended to its base; null: no check (the pill is hidden). */
  healthPath: string | null;
}

export interface SimulatorConfig {
  /** Base URL (or path prefix) each service's paths are appended to; '' means the paths are used as they are. */
  bases: Record<ServiceId, string>;
  /** Health check path per service; null hides that service's pill. */
  healthPaths: Record<ServiceId, string | null>;
  /** Where the browser opens the conversation engine's live socket (HTTP rewrites do not carry it). */
  conversationWs: string;
}

/** The simulator app's own wiring: /svc/<id> rewrites, /health on each service. */
const DEFAULTS: SimulatorConfig = {
  bases: { core: '/svc/core', ref: '/svc/ref', conv: '/svc/conv' },
  healthPaths: { core: '/health', ref: '/health', conv: '/health' },
  conversationWs: '',
};

let config: SimulatorConfig = DEFAULTS;

/** Called once by the host, before rendering, to say where the services are. Unset fields keep the defaults. */
export function configureSimulator(c: Partial<SimulatorConfig>): void {
  config = {
    bases: { ...DEFAULTS.bases, ...c.bases },
    healthPaths: { ...DEFAULTS.healthPaths, ...c.healthPaths },
    conversationWs: c.conversationWs ?? DEFAULTS.conversationWs,
  };
}

export const simulatorConfig = (): SimulatorConfig => config;

const LABELS: Record<ServiceId, string> = { core: 'Core', ref: 'Reference', conv: 'Conversation' };

/** The services, with their health check as the host configured it. */
export const services = (): ServiceInfo[] =>
  (Object.keys(LABELS) as ServiceId[]).map((id) => ({ id, label: LABELS[id], healthPath: config.healthPaths[id] }));

export const svcPath = (id: ServiceId, path: string) => `${config.bases[id]}${path.startsWith('/') ? path : `/${path}`}`;
