export type ServiceId = 'core' | 'ref' | 'conv';

export interface ServiceInfo { id: ServiceId; label: string; envVar: string; defaultUrl: string; healthPath: string }

export const SERVICES: Record<ServiceId, ServiceInfo> = {
  core:   { id: 'core',   label: 'Core',         envVar: 'SIM_CORE_URL',         defaultUrl: 'http://localhost:8082', healthPath: '/health' },
  ref:    { id: 'ref',    label: 'Reference',    envVar: 'SIM_REFERENCE_URL',    defaultUrl: 'http://localhost:8086', healthPath: '/health' },
  conv:   { id: 'conv',   label: 'Conversation', envVar: 'SIM_CONVERSATION_URL', defaultUrl: 'http://localhost:8098', healthPath: '/health' },
};

export const svcPath = (id: ServiceId, path: string) => `/svc/${id}${path.startsWith('/') ? path : `/${path}`}`;

const baseUrl = (env: Record<string, string | undefined>, id: ServiceId) => (env[SERVICES[id].envVar] || SERVICES[id].defaultUrl).replace(/\/+$/, '');

export function serviceRewrites(env: Record<string, string | undefined>) {
  return Object.values(SERVICES).map((s) => ({
    source: `/svc/${s.id}/:path*`,
    destination: `${baseUrl(env, s.id)}/:path*`,
  }));
}
