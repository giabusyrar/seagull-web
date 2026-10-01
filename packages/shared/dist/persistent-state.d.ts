import { type Dispatch, type SetStateAction } from 'react';
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
export declare function readPersisted<T>(key: string): T | undefined;
/**
 * On failure (quota exceeded, storage blocked) the key is removed rather
 * than left holding an older value: a reload must never restore a result
 * from an earlier run as if it were the latest one.
 */
export declare function writePersisted(key: string, value: unknown): void;
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
export declare function usePersistentState<T>(key: string | null, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>];
/** Stores a File/Blob (null deletes it). Failures are logged, not thrown. */
export declare function saveBlob(key: string, blob: Blob | null): Promise<void>;
/** A File saved with saveBlob keeps its name and type. */
export declare function loadBlob<T extends Blob = File>(key: string): Promise<T | null>;
