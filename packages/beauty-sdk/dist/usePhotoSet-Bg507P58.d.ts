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

export { type Photos as P, type PhotoView as a, type PhotoSetState as b, photosKey as p, usePhotoSet as u };
