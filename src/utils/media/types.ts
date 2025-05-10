export interface MediaAsset {
  id: string;
  data: ArrayBuffer;
  type: 'image' | 'video';
  mimeType: string;
  timestamp: number;
  originalName: string;
  size: number;
}

export class MediaStoreError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(message);
    this.name = 'MediaStoreError';
  }
}