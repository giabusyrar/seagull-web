export interface ProxyTarget {
  targetHost: string;
  stripPrefix: boolean;
  healthCheckPath: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
}

export interface ProxyExecutionPayload {
  routeId: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body?: string;
}
