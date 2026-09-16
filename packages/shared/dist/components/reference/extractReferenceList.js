// Reference-service list endpoints respond with `{ data: [...], success }`.
// Older/alternate shapes (`{ <entity>: [...] }` or a bare array) are still
// accepted so the selects keep working against legacy mocks.
export function extractReferenceList(payload, entityKey) {
    if (Array.isArray(payload === null || payload === void 0 ? void 0 : payload.data))
        return payload.data;
    if (Array.isArray(payload === null || payload === void 0 ? void 0 : payload[entityKey]))
        return payload[entityKey];
    if (Array.isArray(payload))
        return payload;
    return [];
}
