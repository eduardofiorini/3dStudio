import * as THREE from 'three';
import { ObjectOptions } from './baseObject';

export async function createMediaPlane(file: File, options: ObjectOptions = {}) {
  try {
    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);

    if (isVideo) {
      const video = document.createElement('video');
      video.src = url;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;

      // Wait for video metadata to load
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });

      // Create video texture
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBAFormat;
      texture.generateMipmaps = false;

      // Calculate aspect ratio and create geometry
      const aspectRatio = video.videoWidth / video.videoHeight;
      const geometry = new THREE.PlaneGeometry(aspectRatio, 1);
      
      // Create material with video texture
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1
      });

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      
      // Try to start playing the video
      try {
        await video.play();
      } catch (error) {
        console.warn('Auto-play failed:', error);
        // Add play button overlay if autoplay fails
        document.addEventListener('click', () => {
          video.play().catch(e => console.warn('Play failed:', e));
        }, { once: true });
      }

      // Store video metadata in userData
      mesh.userData = {
        objectType: 'Video',
        mediaType: 'video',
        video, // Store reference to video element
        dispose: () => {
          video.pause();
          video.src = '';
          video.load();
          URL.revokeObjectURL(url);
          texture.dispose();
          material.dispose();
          geometry.dispose();
        }
      };

      return mesh;
    } else {
      // Handle images
      const loader = new THREE.TextureLoader();
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });

      const aspectRatio = texture.image.width / texture.image.height;
      const geometry = new THREE.PlaneGeometry(aspectRatio, 1);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = {
        objectType: 'Image',
        mediaType: 'image',
        dispose: () => {
          URL.revokeObjectURL(url);
          texture.dispose();
          material.dispose();
          geometry.dispose();
        }
      };

      return mesh;
    }
  } catch (error) {
    console.error('Error creating media plane:', error);
    throw error;
  }
}