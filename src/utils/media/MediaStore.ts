import * as THREE from 'three';
import { MediaAsset, MediaStoreError } from './types';
import { compressImage } from './compression';
import { createMediaTexture } from './textures';

export class MediaStore {
  private db: IDBDatabase | null = null;
  private readonly STORE_NAME = 'media';
  private readonly DB_NAME = 'MediaDB';
  private readonly DB_VERSION = 1;
  private readonly maxTextureSize = 2048;

  async init(): Promise<void> {
    try {
      if (this.db) return;
      
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      this.db = await new Promise((resolve, reject) => {
        request.onerror = () => reject(new MediaStoreError('Failed to open database', request.error));
        request.onsuccess = () => resolve(request.result);
      });
    } catch (error) {
      throw new MediaStoreError('Failed to initialize MediaStore', error);
    }
  }

  async storeMedia(file: File): Promise<string> {
    try {
      if (!this.db) throw new MediaStoreError('Database not initialized');
      
      // Skip storing videos
      if (file.type.startsWith('video/')) {
        throw new MediaStoreError('Video storage not supported');
      }

      const id = crypto.randomUUID();
      const data = await compressImage(file, this.maxTextureSize);

      const asset: MediaAsset = {
        id,
        data,
        type: 'image',
        mimeType: file.type,
        timestamp: Date.now(),
        originalName: file.name,
        size: data.byteLength
      };

      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.add(asset);
        
        request.onerror = () => reject(new MediaStoreError('Failed to store media', request.error));
        request.onsuccess = () => resolve();
      });

      return id;
    } catch (error) {
      throw new MediaStoreError('Failed to store media', error);
    }
  }

  async createMediaPlane(file: File | { id: string }): Promise<THREE.Mesh | null> {
    try {
      let mediaId: string;
      
      if ('id' in file) {
        mediaId = file.id;
      } else {
        mediaId = await this.storeMedia(file);
      }

      const asset = await this.getMediaAsset(mediaId);
      if (!asset) {
        throw new MediaStoreError('Media asset not found');
      }

      const texture = await createMediaTexture(asset);
      if (!texture) {
        throw new MediaStoreError('Failed to create texture');
      }

      const aspectRatio = await this.getAspectRatio(texture, asset.type);
      const geometry = new THREE.PlaneGeometry(aspectRatio, 1);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        metalness: 0,
        roughness: 0.4
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.mediaId = mediaId;
      mesh.userData.mediaType = asset.type;
      mesh.userData.objectType = asset.type === 'video' ? 'Video' : 'Image';

      return mesh;
    } catch (error) {
      console.error('Error creating media plane:', error);
      return null;
    }
  }

  private async getMediaAsset(id: string): Promise<MediaAsset | null> {
    if (!this.db) throw new MediaStoreError('Database not initialized');

    console.log('Getting media asset:', id);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME);
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(id);
      
      request.onerror = () => {
        console.error('Failed to get media asset:', request.error);
        reject(new MediaStoreError('Failed to get media asset', request.error));
      };
      request.onsuccess = () => {
        console.log('Media asset found:', request.result ? 'yes' : 'no');
        resolve(request.result || null);
      };
    });
  }

  private async getAspectRatio(texture: THREE.Texture, type: 'image' | 'video'): Promise<number> {
    if (type === 'video' && texture instanceof THREE.VideoTexture) {
      const video = texture.image as HTMLVideoElement;
      return video.videoWidth / video.videoHeight;
    }
    return texture.image.width / texture.image.height;
  }

  dispose(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  disposeTexture(texture: THREE.Texture): void {
    if (texture.userData.dispose) {
      texture.userData.dispose();
    }
    texture.dispose();
    THREE.Cache.remove(texture.uuid);
  }
}