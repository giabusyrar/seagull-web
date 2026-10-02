import React from 'react';
import { Photos, PhotoView } from '@gateway-experience/beauty-sdk/react';
import { ClassValue } from 'clsx';

type PhotoSetPart = 'root' | 'header' | 'grid' | 'item' | 'title' | 'why' | 'label' | 'slot' | 'image' | 'badge' | 'remove' | 'hint';
interface PhotoSetProps {
    photos: Photos;
    onChange(view: PhotoView, file: File | null): void;
    /** Which slots to show; by default the two optional side views. */
    views?: PhotoView[];
    disabled?: boolean;
    className?: string;
    classNames?: Partial<Record<PhotoSetPart, string>>;
    renderSlot?: (slot: {
        view: PhotoView;
        file?: File;
    }, Default: React.ReactNode) => React.ReactNode;
}
declare function PhotoSet({ photos, onChange, views, disabled, className, classNames, renderSlot }: PhotoSetProps): React.JSX.Element;

declare function cn(...inputs: ClassValue[]): string;

export { PhotoSet, type PhotoSetPart, type PhotoSetProps, cn };
