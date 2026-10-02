import React from 'react';
import { BeautyClient } from '@gateway-experience/beauty-sdk/client';

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

type PhotoView = 'front' | 'left' | 'right';
type Photos = Partial<Record<PhotoView, File>>;
interface PhotoSetState {
    photos: Photos;
    set(view: PhotoView, file: File | null): void;
    clear(): void;
    /** Identity of the set, for tying results to it (useOperation's inputKey). */
    key: string;
}
declare function photosKey(photos: Photos): string;
/** The photos one analysis runs on: a front photo and optional left/right
 *  three-quarter views. Kept in memory only. */
declare function usePhotoSet(initial?: Photos): PhotoSetState;

export { BeautyProvider, type BeautyProviderProps, type Locale, type Messages, type OperationState, type OperationStatus, type PhotoSetState, type PhotoView, type Photos, defaultMessages, format, photosKey, useBeauty, useOperation, usePhotoSet };
