export interface ModelAsset {
  id: string;
  data: ArrayBuffer;
  timestamp: number;
  originalName: string;
  size: number;
  meshes: Array<{
    id: string;
    geometry: ArrayBuffer;
    material: {
      color: string;
      metalness: number;
      roughness: number;
      opacity: number;
    };
  }>;
}

export class ModelStoreError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(message);
    this.name = 'ModelStoreError';
  }
}