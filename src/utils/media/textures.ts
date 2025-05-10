import * as THREE from 'three';
import { MediaAsset } from './types';

export async function createMediaTexture(asset: MediaAsset): Promise<THREE.Texture | null> {
  try {
    console.log('Creating texture for media type:', asset.type);

    if (asset.type === 'video') {
      const texture = await createVideoTexture(asset);
      console.log('Video texture created successfully');
      return texture;
    } else {
      const texture = await createImageTexture(asset);
      console.log('Image texture created successfully');
      return texture;
    }
  } catch (error) {
    console.error('Error creating texture:', error);
    return null;
  }
}

async function createVideoTexture(asset: MediaAsset): Promise<THREE.VideoTexture> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    let isDisposed = false;

    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    // Create object URL from asset data
    const blob = new Blob([asset.data], { type: asset.mimeType });
    video.src = URL.createObjectURL(blob);

    video.onloadedmetadata = async () => {
      try {
        if (isDisposed) return;

        await video.play();
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;
        
        // Add cleanup function
        texture.userData.dispose = () => {
          isDisposed = true;
          video.pause();
          video.src = '';
          video.load();
        };

        resolve(texture);
      } catch (error) {
        isDisposed = true;
        reject(error);
      }
    };

    video.onerror = () => {
      isDisposed = true;
      reject(new Error('Failed to load video'));
    };

    // Add timeout to prevent hanging
    setTimeout(() => {
      if (!video.readyState) {
        isDisposed = true;
        reject(new Error('Video load timeout'));
      }
    }, 10000);
  });
}

async function createImageTexture(asset: MediaAsset): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    // Create a blob URL from the asset data
    const blob = new Blob([asset.data], { type: asset.mimeType });
    const img = new Image();
    img.onload = () => {
      const texture = new THREE.Texture(img);
      texture.needsUpdate = true;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      resolve(texture);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
}