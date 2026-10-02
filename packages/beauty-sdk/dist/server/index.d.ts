import { O as OperationId } from '../operations-Wgq0we7R.js';

interface BeautyProxyOptions {
    gatewayUrl: string;
    apiKey: string;
    brandId: string;
    applicationId: string;
    /** Return { customerId } from the brand's session, or a Response to refuse.
     *  Without it, customer routes answer 401. */
    authorize?: (req: Request) => Promise<{
        customerId?: string;
    } | Response> | {
        customerId?: string;
    } | Response;
    timeouts?: Partial<Record<OperationId, number>>;
    fetch?: typeof fetch;
}
type RouteHandler = (req: Request, ctx: {
    params: Promise<{
        path?: string[];
    }>;
}) => Promise<Response>;
/**
 * The brand's server-side door to the gateway, for
 * app/api/beauty/[...path]/route.ts:
 *   export const { GET, POST } = createBeautyProxy({ ... });
 * Forwards only the SDK's operations, writes brand/application (and the
 * signed-in customer) itself, adds the API key, and streams bodies through.
 */
declare function createBeautyProxy(opts: BeautyProxyOptions): {
    GET: RouteHandler;
    POST: RouteHandler;
};

/** For operations with no core-engine timeout to derive from (reference
 *  reads, survey evaluate, assessment history). A proxy-side choice,
 *  overridable per operation. */
declare const DEFAULT_PROXY_TIMEOUT_MS = 15000;
declare const OPERATION_TIMEOUT_MS: Record<OperationId, number>;

export { type BeautyProxyOptions, DEFAULT_PROXY_TIMEOUT_MS, OPERATION_TIMEOUT_MS, type RouteHandler, createBeautyProxy };
