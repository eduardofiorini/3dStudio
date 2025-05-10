import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Initialize Draco loader once
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
dracoLoader.setDecoderConfig({ type: 'js' }); // Use JS decoder for better compatibility

export async function loadDracoGLB(file: File): Promise<THREE.Object3D> {
  let url: string | null = null;

  try {
    // Verify file extension
    if (!file.name.toLowerCase().endsWith('.glb')) {
      throw new Error('Invalid file type - must be .glb');
    }

    // Create URL for the file
    url = URL.createObjectURL(file);

    // Set up GLTFLoader with Draco support
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Load the GLB file
    const gltf = await new Promise<THREE.GLTF>((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });

    // Validate GLTF scene
    if (!gltf.scene) {
      throw new Error('GLTF scene failed to load.');
    }

    // Log metrics
    let totalVertices = 0;
    let totalTriangles = 0;
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const position = child.geometry.getAttribute('position');
        if (position) {
          totalVertices += position.count;
          totalTriangles += (child.geometry.index?.count ?? 0) / 3;
        }
      }
    });

    console.log('Draco GLB Model Metrics:', {
      name: file.name,
      originalSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      vertices: totalVertices.toLocaleString(),
      triangles: totalTriangles.toLocaleString(),
    });

    const model = gltf.scene;

    // Set up model metadata
    model.userData = {
      ...model.userData,
      isGLBModel: true,
      originalName: file.name,
    };

    // Apply material updates and shadows
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Preserve normal maps when converting materials
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          const oldMaterial = child.material;
          const newMaterial = new THREE.MeshStandardMaterial({
            color: oldMaterial?.color || '#4a4a4a',
            metalness: 0.1,
            roughness: 0.7,
          });

          // Transfer normal map if it exists
          if (oldMaterial.normalMap) {
            newMaterial.normalMap = oldMaterial.normalMap;
            newMaterial.normalScale.copy(oldMaterial.normalScale);
          }

          child.material = newMaterial;
          oldMaterial?.dispose();
        }
      }
    });

    // Center the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, 0.5 - center.y, -center.z);

    return model;
  } catch (error) {
    console.error('Error loading Draco GLB model:', error);
    throw error;
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
}

// Clean up Draco loader when no longer needed
export function disposeDracoLoader() {
  dracoLoader.dispose();
}