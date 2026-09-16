import { interpolateGlobalVariables } from './interpolate';

export interface CollectionParameterRow {
  kind: 'header' | 'query';
  key: string;
  value: string;
  enabled: boolean;
}

export function buildInjectedValues(
  parameters: CollectionParameterRow[],
  variables: Record<string, string>
): { headers: Record<string, string>; queryParams: Record<string, string> } {
  const headers: Record<string, string> = {};
  const queryParams: Record<string, string> = {};

  for (const param of parameters) {
    if (!param.enabled) continue;
    const resolvedValue = interpolateGlobalVariables(param.value, variables);
    if (param.kind === 'header') {
      headers[param.key] = resolvedValue;
    } else {
      queryParams[param.key] = resolvedValue;
    }
  }

  return { headers, queryParams };
}
