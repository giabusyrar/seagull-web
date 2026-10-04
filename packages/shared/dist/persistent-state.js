'use client';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
/**
 * Browser-local persistence for work in progress in the consoles (simulator
 * inputs, Try & Send drafts, last results), so a reload reopens where the
 * operator left off. Values stay in this browser only — nothing here is sent
 * anywhere or shared between users.
 *
 * JSON values go to localStorage (synchronous, so a view mounted on the
 * client starts with its saved state and no flash). Files and blobs go to
 * IndexedDB (see saveBlob/loadBlob): localStorage is capped at a few MB per
 * origin and would need base64, which a single photo can exhaust.
 */
export function readPersisted(key) {
    if (typeof window === 'undefined')
        return undefined;
    try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? undefined : JSON.parse(raw);
    }
    catch (_a) {
        return undefined;
    }
}
/**
 * On failure (quota exceeded, storage blocked) the key is removed rather
 * than left holding an older value: a reload must never restore a result
 * from an earlier run as if it were the latest one.
 */
export function writePersisted(key, value) {
    if (typeof window === 'undefined')
        return;
    try {
        if (value === undefined)
            window.localStorage.removeItem(key);
        else
            window.localStorage.setItem(key, JSON.stringify(value));
    }
    catch (e) {
        console.warn(`Could not persist "${key}"; dropping the saved copy`, e);
        try {
            window.localStorage.removeItem(key);
        }
        catch (_a) {
            // storage unavailable altogether — nothing saved, nothing stale
        }
    }
}
/**
 * A value stored as a bare string rather than JSON, for keys whose saved
 * format predates readPersisted (e.g. an id written with setItem(key, id)).
 * Reading such a key with readPersisted would fail to parse it.
 */
export function readPersistedString(key) {
    if (typeof window === 'undefined')
        return null;
    try {
        return window.localStorage.getItem(key);
    }
    catch (_a) {
        return null;
    }
}
/** Stores a bare string; null removes the key. Same failure rule as writePersisted. */
export function writePersistedString(key, value) {
    if (typeof window === 'undefined')
        return;
    try {
        if (value === null)
            window.localStorage.removeItem(key);
        else
            window.localStorage.setItem(key, value);
    }
    catch (e) {
        console.warn(`Could not persist "${key}"; dropping the saved copy`, e);
        try {
            window.localStorage.removeItem(key);
        }
        catch (_a) {
            // storage unavailable altogether — nothing saved, nothing stale
        }
    }
}
const noopSubscribe = () => () => { };
/**
 * useState that survives a reload. `key` null disables persistence (plain
 * useState), and changing `key` loads that key's value — use it to scope a
 * draft to, say, one route or one questionnaire.
 *
 * Hydration-safe: while React is hydrating server HTML the initial value is
 * used (the server has no localStorage), and the saved value is swapped in
 * on the render right after. A view mounted purely on the client reads its
 * saved value on the very first render.
 */
export function usePersistentState(key, initial) {
    const canRead = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const resolveInitial = () => (typeof initial === 'function' ? initial() : initial);
    const load = (k) => {
        if (!k)
            return resolveInitial();
        const saved = readPersisted(k);
        return saved === undefined ? resolveInitial() : saved;
    };
    const [state, setState] = useState(() => canRead ? { key, value: load(key) } : { key: null, value: resolveInitial() });
    // Adjusting state during render (not in an effect) so children never see
    // the previous key's value paired with the new key.
    let current = state;
    if (canRead && state.key !== key) {
        current = { key, value: load(key) };
        setState(current);
    }
    useEffect(() => {
        if (state.key !== null && state.key === key)
            writePersisted(state.key, state.value);
    }, [key, state]);
    const set = useCallback((action) => {
        setState((prev) => (Object.assign(Object.assign({}, prev), { value: typeof action === 'function' ? action(prev.value) : action })));
    }, []);
    return [current.value, set];
}
const BLOB_DB = 'xg-persisted-blobs';
const BLOB_STORE = 'blobs';
function openBlobDb() {
    return new Promise((resolve, reject) => {
        const req = window.indexedDB.open(BLOB_DB, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(BLOB_STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
async function blobTx(mode, run) {
    const db = await openBlobDb();
    try {
        return await new Promise((resolve, reject) => {
            const req = run(db.transaction(BLOB_STORE, mode).objectStore(BLOB_STORE));
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
    finally {
        db.close();
    }
}
/** Stores a File/Blob (null deletes it). Failures are logged, not thrown. */
export async function saveBlob(key, blob) {
    if (typeof window === 'undefined' || !window.indexedDB)
        return;
    try {
        if (blob)
            await blobTx('readwrite', (s) => s.put(blob, key));
        else
            await blobTx('readwrite', (s) => s.delete(key));
    }
    catch (e) {
        console.warn(`Could not persist file "${key}"`, e);
    }
}
/** A File saved with saveBlob keeps its name and type. */
export async function loadBlob(key) {
    if (typeof window === 'undefined' || !window.indexedDB)
        return null;
    try {
        const value = await blobTx('readonly', (s) => s.get(key));
        return value instanceof Blob ? value : null;
    }
    catch (_a) {
        return null;
    }
}
