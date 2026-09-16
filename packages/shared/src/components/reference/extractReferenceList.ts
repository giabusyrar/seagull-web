// Reference-service list endpoints respond with `{ data: [...], success }`.
// Older/alternate shapes (`{ <entity>: [...] }` or a bare array) are still
// accepted so the selects keep working against legacy mocks.
export function extractReferenceList(payload: any, entityKey: string): any[] {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.[entityKey])) return payload[entityKey];
  if (Array.isArray(payload)) return payload;
  return [];
}
