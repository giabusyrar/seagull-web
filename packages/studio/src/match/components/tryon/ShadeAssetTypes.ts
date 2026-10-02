export type { Shade } from '../../types';

export interface ShadeAsset {
  id: string;
  shadeId: string;
  colorMapUrl: string;
  alphaMapUrl: string;
  finishMapUrl?: string;
}
