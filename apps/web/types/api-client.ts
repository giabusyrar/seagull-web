export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
  required?: boolean;
}

export interface MultipartField {
  id: string;
  key: string;
  type: 'text' | 'file';
  value: string;
  /** Only set for type 'file'. Never persisted — re-picked each Send. */
  file?: File | null;
  enabled: boolean;
}

export interface ApiClientRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  bodyType: 'json' | 'raw' | 'form-data' | 'none';
  /** Set alongside bodyType: 'form-data' — real multipart with file uploads,
   *  distinct from the JSON body the 'form' template mode still writes to
   *  `body`. */
  multipartFields?: MultipartField[];
}

export interface ResponseData {
  status: number | null;
  statusText: string | null;
  latency: number | null;
  size: string | null;
  headers: Record<string, string>;
  body: string | null;
  error: string | null;
  timestamp?: number;
}

export interface TabItem {
  id: string;
  title: string;
  method?: HttpMethod;
  requestId?: string;
  isDirty?: boolean;
  type: 'request' | 'overview' | 'api-keys' | 'forms' | 'scoring' | 'matching' | 'vision' | 'tryon' | 'pipeline' | 'assessments' | 'applications' | 'reference';
  entity?: string;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  isSecret?: boolean;
}

export interface Environment {
  id: string;
  name: string;
  isDefault?: boolean;
  variables: EnvironmentVariable[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface Collection {
  id: string;
  parentId?: string | null;
  name: string;
  type: 'proxy' | 'llm' | 'core-engine';
  originalPrefix: string | null;
  healthCheckPath: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheckedAt: string | null;
  activeEnvironmentId: string | null;
  activeTargetHost: string | null;
  provider: string | null;
  outboundSecretId: string | null;
  knowledgeBase: string | null;
  orderIndex?: number;
  isCore?: boolean;
}

export interface HistoryItem {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  statusText?: string;
  latencyMs: number;
  timestamp: string | number;
  brandId?: string | null;
  brandName?: string | null;
  collectionId?: string | null;
  requestBody?: string | null;
  responseBody?: string | null;
}

export interface CollectionEnvironment {
  id: string;
  collectionId: string;
  name: string;
  targetHost: string;
}

export interface RouteGroup {
  id: string;
  collectionId: string;
  parentId?: string | null;
  name: string;
  prefix?: string | null;
  orderIndex?: number;
}

export interface ExecutionLogRecord {
  requestId: string;
  routeId: string;
  collectionId: string;
  brandId?: string;
  apiKeyId?: string;
  apiKeyName?: string;
  method: HttpMethod;
  url: string;
  status: number;
  statusText: string;
  latencyMs: number;
  clientIp?: string;
  requestHeaders?: string;
  responseBody?: string;
  tokensPrompt?: number;
  tokensCompletion?: number;
  estimatedCost?: number;
  createdAt: string;
}

export interface Route {
  id: string;
  collectionId: string;
  groupId: string | null;
  name: string;
  method: string;
  originalPattern: string;
  targetPattern: string | null;
  llmModel: string | null;
  systemInstruction: string | null;
  outputSchema: string | null;
  routeParams?: string | null;
}

export interface ApiKey {
  id: string;
  name: string;
  keyLastFour: string;
  allCollections: boolean;
  allowedCollectionIds?: string[];
  allBrands: boolean;
  allowedBrandIds?: string[];
  allApplications: boolean;
  allowedAppIds?: string[];
  allowedMethods: string | null;
  rateLimitPerMinute: number | null;
  status: 'active' | 'revoked';
  lastUsedAt: string | null;
}

export interface GlobalSecret {
  id: string;
  name: string;
  valueLastFour: string;
  enabled: boolean;
}
