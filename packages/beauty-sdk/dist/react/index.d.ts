import React from 'react';
export { b as PhotoSetState, a as PhotoView, P as Photos, p as photosKey, u as usePhotoSet } from '../usePhotoSet-Bg507P58.js';

type OperationId = 'colour.analyze' | 'colour.tryOn' | 'colour.catalog' | 'face.analyze' | 'face.head' | 'skin.analyze' | 'reference.brands' | 'reference.products' | 'forms.evaluate' | 'assessments.history';

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

type Locale = 'id' | 'en';
type Messages = Record<string, string>;
declare const defaultMessages: Record<Locale, Messages>;
declare function format(template: string, vars?: Record<string, string | number>): string;

interface BeautyContext {
    client: BeautyClient;
    locale: Locale;
    t: (key: string, vars?: Record<string, string | number>) => string;
}
interface BeautyProviderProps {
    /** The brand's proxy route, e.g. "/api/beauty". Ignored when `client` is given. */
    baseUrl?: string;
    client?: BeautyClient;
    locale?: Locale;
    /** Overrides for any message key. */
    messages?: Messages;
    children: React.ReactNode;
}
declare function BeautyProvider({ baseUrl, client, locale, messages, children }: BeautyProviderProps): React.JSX.Element;
declare function useBeauty(): BeautyContext;

type OperationStatus = 'idle' | 'loading' | 'success' | 'error';
interface OperationState<T> {
    status: OperationStatus;
    data: T | null;
    error: unknown;
    run: () => Promise<void>;
    reset: () => void;
}
/**
 * One call's lifecycle, the shape every SDK hook returns. A result belongs to
 * the input it was run for (`inputKey`, e.g. the photos' identity): once the
 * input changes it reads as idle. A new run aborts the previous one; aborts
 * from supersession or unmount are not errors.
 */
declare function useOperation<T>(fn: (signal: AbortSignal) => Promise<T>, inputKey: string): OperationState<T>;

export { BeautyProvider, type BeautyProviderProps, type Locale, type Messages, type OperationState, type OperationStatus, defaultMessages, format, useBeauty, useOperation };
