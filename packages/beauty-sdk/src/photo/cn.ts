import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The SDK's own classes carry the bsdk prefix; brand classes do not, so the
// two never cancel each other and the brand's always apply.
const twMerge = extendTailwindMerge({ prefix: 'bsdk' });

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
