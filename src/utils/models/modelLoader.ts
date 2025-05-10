import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { loadDracoGLB } from './dracoLoader';
import { ModelStore } from './ModelStore';

// Initialize Draco loader once
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
dracoLoader.setDecoderConfig({ type: 'js' }); // Use JS decoder for better compatibility

export async function loadGLBModel(file: File): Promise<THREE.Object3D> {
  const modelStore = ModelStore.getInstance();
  let url: string | null = null;

  // Log start of loading process
  console.log('Starting GLB model load:', {
    name: file.name,
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
  });

  try {
    // Check for Draco compression by examining file header
    const buffer = await file.arrayBuffer();
    const header = new Uint8Array(buffer.slice(0, 20));
    const isDraco = header.indexOf('DRACO') !== -1;

    if (isDraco) {
      console.log('Detected Draco-compressed GLB, using Draco loader');
      return loadDracoGLB(file);
    }

    // Verify file extension
    if (!file.name.toLowerCase().endsWith('.glb')) {
      const error = new Error('Invalid file type - must be .glb');
      console.error('File type error:', error);
      throw error;
    }

    // Initialize the model store
    await modelStore.init();

    // Store the model and get its ID
    const modelId = await modelStore.storeModel(file);
    console.log('Model stored with ID:', modelId);

    // Create a URL for the file
    url = URL.createObjectURL(file);

    // Set up GLTFLoader and link DRACOLoader
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Load the GLB file
    const gltf = await new Promise<THREE.GLTF>((resolve, reject) => {
      loader.load(
        url,
        resolve,
        (progress) => {
          console.log('Loading progress:', {
            loaded: progress.loaded,
            total: progress.total,
            percent: ((progress.loaded / progress.total) * 100).toFixed(1) + '%'
          });
        },
        async (error) => {
          // If normal load fails, try Draco loader as fallback
          try {
            if (url) URL.revokeObjectURL(url);
            console.log('Standard load failed, attempting Draco loader...');
            const model = await loadDracoGLB(file);
            resolve({ scene: model } as THREE.GLTF);
          } catch (dracoError) {
            console.error('Both standard and Draco loading failed:', { error, dracoError });
            reject(error);
          }
        }
      );
    });

    // Validate GLTF scene
    if (!gltf.scene) {
      const error = new Error('GLTF scene failed to load - scene is null');
      console.error('Scene validation error:', error);
      throw error;
    }

    console.log('Loaded GLTF:', gltf);

    // Log metrics and prepare the model
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

    console.log('GLB Model Metrics:', {
      name: file.name,
      originalSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      vertices: totalVertices.toLocaleString(),
      triangles: totalTriangles.toLocaleString(),
    });

    const model = gltf.scene;

    // Set up model metadata
    model.userData = {
      ...model.userData,
      modelId,
      isGLBModel: true,
      originalName: file.name,
    };

    // Apply material updates and shadows
    model.traverse((child) => {
      if (!child) return; // Ensure the child exists

      if (!child.userData) {
        child.userData = {
          modelId,
          isGLBModel: true,
          objectType: 'GLB Model',
        };
      } else {
        child.userData = {
          ...child.userData,
          modelId,
          isGLBModel: true,
          objectType: 'GLB Model',
        };
      }

      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Convert material to MeshStandardMaterial if necessary
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          const oldMaterial = child.material;
          child.material = new THREE.MeshStandardMaterial({
            color: oldMaterial?.color || '#4a4a4a',
            metalness: 0.1,
            roughness: 0.7,
          });
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
    // Enhanced error logging
    console.error('Error loading GLB model:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileName: file.name,
      fileSize: file.size,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  } finally {
    if (url) {
      URL.revokeObjectURL(url);
      console.log('Cleaned up object URL');
    }
    // Dispose of DracoLoader only if it's no longer needed
    dracoLoader.dispose();
    console.log('Disposed of DracoLoader');
  }
}

export async function reloadGLBModel(modelId: string): Promise<THREE.Object3D | null> {
  const modelStore = ModelStore.getInstance();
  try {
    await modelStore.init();
    return modelStore.loadModel(modelId);
  } catch (error) {
    console.error('Error reloading GLB model:', error);
    return null;
  }
}