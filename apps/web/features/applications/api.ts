/**
 * Dashboard API calls behind the Applications view: the application registry
 * (/api/reference/applications) and per-application pipeline config
 * (/api/pipeline-config).
 */

export interface ApplicationItem {
  id: string;
  key: string;
  name: string;
  description?: string;
  channelType?: string;
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ApplicationInput {
  key: string;
  name: string;
  description: string;
  channelType: string;
}

/** Null unless the route reports success with a list. */
export async function listApplications(): Promise<ApplicationItem[] | null> {
  const data = await (await fetch('/api/reference/applications')).json();
  const list = data.applications || data.data || data.items;
  return data.success && Array.isArray(list) ? list : null;
}

/** POST a new application or PUT an edited one. Resolves to whether the route accepted it. */
export async function saveApplication(input: ApplicationInput, isEdit: boolean): Promise<boolean> {
  const res = await fetch('/api/reference/applications', {
    method: isEdit ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.ok;
}

/** Resolves to whether the route deleted it. */
export async function deleteApplication(key: string): Promise<boolean> {
  const res = await fetch(`/api/reference/applications/${encodeURIComponent(key)}`, { method: 'DELETE' });
  return res.ok;
}

export interface PipelineConfig {
  formEnabled?: boolean;
  questionnaireCode?: string;
  visionEnabled?: boolean;
  visionPipelineCode?: string;
}

/** The stored config for a brand/application, or null when there is none. */
export async function getPipelineConfig(brandId: string, applicationId: string): Promise<PipelineConfig | null> {
  const res = await fetch(`/api/pipeline-config?brandId=${encodeURIComponent(brandId)}&applicationId=${encodeURIComponent(applicationId)}`);
  const data = await res.json();
  return data.success && data.config ? (data.config as PipelineConfig) : null;
}

export interface PipelineConfigInput {
  brandId: string;
  applicationId: string;
  formEnabled: boolean;
  questionnaireCode: string;
  visionEnabled: boolean;
  visionPipelineCode: string;
}

/** The route's `{ success, error }` answer. */
export async function savePipelineConfig(input: PipelineConfigInput): Promise<{ success?: boolean; error?: string }> {
  const res = await fetch('/api/pipeline-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
}
