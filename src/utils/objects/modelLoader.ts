import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { createStandardMaterial } from '../materials/standardMaterial';
import { setupPhysicsForMesh } from '../physics/modelPhysics';
import { ModelStore } from '../models/ModelStore';

let modelStore: ModelStore | null = null;

// Initialize ModelStore
async function getModelStore() {
  if (!modelStore) {
    modelStore = new ModelStore();
    await modelStore.init();
  }
  return modelStore;
}

// Utility for logging model loading results
function logModelLoading(gltf: any, modelId: string, fileName: string) {
  console.log('GLTFLoader result:', {
    modelId,
    isGLB: gltf.isGLB,
    meshCount: gltf.scene.children.filter((c: any) => c instanceof THREE.Mesh).length,
    fileName
  });
}

export async function loadGLBModel(file: File): Promise<THREE.Object3D | null> {
  const url = URL.createObjectURL(file);

  try {
    const store = await getModelStore();
    const modelId = await store.storeModel(file);
    
    // Verify file extension
    if (!file.name.toLowerCase().endsWith('.glb')) {
      throw new Error('Invalid file type - must be .glb');
    }
    
    // Verify file signature
    const buffer = await file.arrayBuffer();
    const header = new Uint8Array(buffer.slice(0, 4));
    const isGLB = header[0] === 0x67 && header[1] === 0x6C && 
                  header[2] === 0x54 && header[3] === 0x46; // "glTF"
    
    if (!isGLB) {
      throw new Error('Invalid GLB file format');
    }

    // Setup loaders
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/v3/decoders/');
    const ktx2Loader = new KTX2Loader();
    loader.setDRACOLoader(dracoLoader);
    loader.setKTX2Loader(ktx2Loader);

    // Load the GLB file
    const model = await new Promise<THREE.Object3D>((resolve, reject) => {
      loader.load(url, (gltf) => {
        logModelLoading(gltf, modelId, file.name);

        const model = gltf.scene;

        // Set model flags based on loader detection
        model.userData.modelId = modelId;
        model.userData.isGLBModel = true; // We verified it's GLB above
        model.userData.objectType = 'GLB Model';
        model.userData.originalName = file.name;
        model.type = 'Group';

        // Process nodes in the hierarchy
        model.traverse((child) => {
          child.userData = {
            ...child.userData,
            modelId,
            isGLBModel: gltf.isGLB,
            objectType: 'GLB Model'
          };

          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Ensure material is MeshStandardMaterial
            if (!(child.material instanceof THREE.MeshStandardMaterial)) {
              const oldMaterial = child.material;
              const newMaterial = createStandardMaterial({
                color: oldMaterial.color || '#4a4a4a',
                metalness: 0.1,
                roughness: 0.7
              });
              child.material = newMaterial;
              if (oldMaterial) oldMaterial.dispose();
            }
          }
        });

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.set(-center.x, 0.5 - center.y, -center.z);

        // Setup physics properties
        setupPhysicsForMesh(model);

        resolve(model);
      }, undefined, (error) => {
        reject(error);
      });
    });

    return model;
  } catch (error) {
    console.error('Error loading GLB model:', error);
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function reloadGLBModel(modelId: string): Promise<THREE.Object3D | null> {
  try {
    const store = await getModelStore();
    return store.loadModel(modelId);
  } catch (error) {
    console.error('Error reloading GLB model:', error);
    return null;
  }
}

export function disposeModelStore() {
  if (modelStore) {
    modelStore.dispose();
    modelStore = null;
  }
}
