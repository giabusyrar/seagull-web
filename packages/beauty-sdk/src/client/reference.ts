import type { BeautyClient } from './transport';

export interface ReferenceBrand {
  id: string;
  code: string;
  name: string;
}

export interface ReferenceProduct {
  id: string;
  brandId: string | null;
  categoryId: string | null;
  name: string;
  imageUrl: string;
  isActive: boolean;
}

export interface ReferenceMethods {
  brands(signal?: AbortSignal): Promise<ReferenceBrand[]>;
  products(signal?: AbortSignal): Promise<ReferenceProduct[]>;
}

// reference-service wraps lists as { success, data }.
export function referenceMethods(client: Pick<BeautyClient, 'json'>): ReferenceMethods {
  return {
    brands: async (signal) => {
      const res = await client.json<{ data?: ReferenceBrand[] }>('reference.brands', { signal });
      if (!('data' in res) || res.data === undefined) {
        throw new Error('reference.brands: response has no data list');
      }
      return res.data;
    },
    products: async (signal) => {
      const res = await client.json<{ data?: ReferenceProduct[] }>('reference.products', { signal });
      if (!('data' in res) || res.data === undefined) {
        throw new Error('reference.products: response has no data list');
      }
      return res.data;
    },
  };
}
