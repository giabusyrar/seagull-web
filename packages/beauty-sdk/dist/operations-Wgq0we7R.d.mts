type OperationId = 'colour.analyze' | 'colour.tryOn' | 'colour.catalog' | 'face.analyze' | 'face.head' | 'skin.analyze' | 'reference.brands' | 'reference.products' | 'forms.evaluate' | 'assessments.history';
/** Where brand and application go: the gateway path, a JSON body
 *  (brand_id / application_id), a multipart body (brandId / applicationId),
 *  or nowhere. */
type ScopePlacement = 'none' | 'path' | 'json' | 'multipart';
interface Operation {
    id: OperationId;
    method: 'GET' | 'POST';
    /** Path under the SDK base url; `:name` segments come from the caller. */
    sdkPath: string;
    /** Gateway path; `{brandId}`, `{applicationId}`, `{customerId}` come from the
     *  scope, `:name` from the caller. */
    gatewayPath: string;
    scope: ScopePlacement;
    /** Needs a signed-in customer (authorize must return a customerId). */
    customer: boolean;
    /** Query keys that may reach the gateway; everything else is dropped. */
    query: readonly string[];
}
declare const OPERATIONS: readonly Operation[];

export { type OperationId as O, type ScopePlacement as S, OPERATIONS as a, type Operation as b };
