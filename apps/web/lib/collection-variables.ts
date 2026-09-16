import { apiClient } from './api-client';

/**
 * Builds the {{name}} interpolation map for a collection's Global Parameters.
 */
export async function resolveCollectionVariables(collectionId: string): Promise<Record<string, string>> {
  try {
    const [variables, secrets] = await Promise.all([
      apiClient.raw<any[]>(`/api/v1/collections/${collectionId}/global-variables`).catch(() => []),
      apiClient.raw<any[]>('/api/v1/secrets').catch(() => []),
    ]);

    const result: Record<string, string> = {};
    for (const secret of secrets || []) {
      if (secret.name && secret.value) {
        result[secret.name] = secret.value;
      }
    }
    for (const variable of variables || []) {
      if (variable.key && variable.value) {
        result[variable.key] = variable.value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/** Resolves one specific secret by id - used by LLM invocation via Collection.outboundSecretId. */
export async function resolveGlobalSecretValue(secretId: string): Promise<string | null> {
  try {
    const secrets = await apiClient.raw<any[]>('/api/v1/secrets').catch(() => []);
    const match = (secrets || []).find((s: any) => s.id === secretId);
    return match?.value || null;
  } catch {
    return null;
  }
}
