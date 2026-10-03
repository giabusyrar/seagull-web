export type ServiceId = 'core' | 'ref' | 'conv' | 'colour' | 'face' | 'skin' | 'tryon';

export interface ServiceInfo { id: ServiceId; label: string; envVar: string; defaultUrl: string; healthPath: string }

export const SERVICES: Record<ServiceId, ServiceInfo> = {
  core:   { id: 'core',   label: 'Core',         envVar: 'SIM_CORE_URL',         defaultUrl: 'http://localhost:8082', healthPath: '/health' },
  ref:    { id: 'ref',    label: 'Reference',    envVar: 'SIM_REFERENCE_URL',    defaultUrl: 'http://localhost:8086', healthPath: '/health' },
  conv:   { id: 'conv',   label: 'Conversation', envVar: 'SIM_CONVERSATION_URL', defaultUrl: 'http://localhost:8098', healthPath: '/health' },
  colour: { id: 'colour', label: 'Colour',       envVar: 'SIM_COLOUR_URL',       defaultUrl: 'http://localhost:8092', healthPath: '/health' },
  face:   { id: 'face',   label: 'Face',         envVar: 'SIM_FACE_URL',         defaultUrl: 'http://localhost:8094', healthPath: '/health' },
  skin:   { id: 'skin',   label: 'Skin',         envVar: 'SIM_SKIN_URL',         defaultUrl: 'http://localhost:8088', healthPath: '/health' },
  tryon:  { id: 'tryon',  label: 'Try-on',       envVar: 'SIM_TRYON_URL',        defaultUrl: 'http://localhost:8090', healthPath: '/health' },
};

export const svcPath = (id: ServiceId, path: string) => `/svc/${id}${path.startsWith('/') ? path : `/${path}`}`;

export function serviceRewrites(env: Record<string, string | undefined>) {
  return Object.values(SERVICES).map((s) => ({
    source: `/svc/${s.id}/:path*`,
    destination: `${(env[s.envVar] || s.defaultUrl).replace(/\/+$/, '')}/:path*`,
  }));
}
