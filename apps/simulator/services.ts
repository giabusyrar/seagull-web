// Where the simulator app finds the services: base URLs from .env (server
// side, for the /svc/<id> rewrites in next.config.ts), with local-dev defaults.
// The screens themselves live in @gateway-experience/simulator-kit and only
// know the /svc/<id> paths.

export type ServiceId = 'core' | 'ref' | 'conv';

export interface ServiceUrl { id: ServiceId; envVar: string; defaultUrl: string }

export const SERVICES: Record<ServiceId, ServiceUrl> = {
  core: { id: 'core', envVar: 'SIM_CORE_URL', defaultUrl: 'http://localhost:8082' },
  ref: { id: 'ref', envVar: 'SIM_REFERENCE_URL', defaultUrl: 'http://localhost:8086' },
  conv: { id: 'conv', envVar: 'SIM_CONVERSATION_URL', defaultUrl: 'http://localhost:8098' },
};

const baseUrl = (env: Record<string, string | undefined>, id: ServiceId) => (env[SERVICES[id].envVar] || SERVICES[id].defaultUrl).replace(/\/+$/, '');

export function serviceRewrites(env: Record<string, string | undefined>) {
  return Object.values(SERVICES).map((s) => ({
    source: `/svc/${s.id}/:path*`,
    destination: `${baseUrl(env, s.id)}/:path*`,
  }));
}
