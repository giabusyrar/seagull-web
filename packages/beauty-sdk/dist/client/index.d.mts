import { O as OperationId } from '../operations-Wgq0we7R.mjs';
export { a as OPERATIONS, b as Operation, S as ScopePlacement } from '../operations-Wgq0we7R.mjs';

interface ReferenceBrand {
    id: string;
    code: string;
    name: string;
}
interface ReferenceProduct {
    id: string;
    brandId: string | null;
    categoryId: string | null;
    name: string;
    imageUrl: string;
    isActive: boolean;
}
interface ReferenceMethods {
    brands(signal?: AbortSignal): Promise<ReferenceBrand[]>;
    products(signal?: AbortSignal): Promise<ReferenceProduct[]>;
}

interface BeautyClientOptions {
    /** Browser: the proxy route (e.g. "/api/beauty"). Server: the gateway url. */
    baseUrl: string;
    /** Server only. With a key the client talks to the gateway directly. */
    apiKey?: string;
    brandId?: string;
    applicationId?: string;
    customerId?: string;
    fetch?: typeof fetch;
}
interface CallInit {
    params?: Record<string, string>;
    query?: Record<string, string>;
    body?: FormData | Record<string, unknown>;
    signal?: AbortSignal;
}
interface BeautyClient {
    call(id: OperationId, init?: CallInit): Promise<Response>;
    json<T>(id: OperationId, init?: CallInit): Promise<T>;
    binary(id: OperationId, init?: CallInit): Promise<ArrayBuffer>;
    reference: ReferenceMethods;
}
declare function createBeautyClient(opts: BeautyClientOptions): BeautyClient;

/** Every failed SDK call, whatever the engine. Nothing is invented: a body
 *  that is not JSON stays the message, and no code is claimed for it. */
declare class BeautyApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details: Record<string, unknown>[];
    constructor(init: {
        status: number;
        code: string;
        message: string;
        details: Record<string, unknown>[];
    });
}
/**
 * Core answers errors in two shapes: `{ detail: {...} | [...] }` (vision,
 * face architecture, head) and `{ code, error | message }` (colour). Both
 * become one BeautyApiError; every detail entry is kept.
 */
declare function parseApiError(res: Response): Promise<BeautyApiError>;

export { BeautyApiError, type BeautyClient, type BeautyClientOptions, type CallInit, OperationId, type ReferenceBrand, type ReferenceProduct, createBeautyClient, parseApiError };
