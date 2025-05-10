import * as THREE from 'three';
import { ModelAsset, ModelStoreError } from './types';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { createStandardMaterial } from '../materials/standardMaterial';
import { setupPhysicsForMesh } from '../physics/modelPhysics';

// Initialize Draco loader once
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
dracoLoader.setDecoderConfig({ type: 'js' }); // Use JS decoder for better compatibility

export class ModelStore {
  private static instance: ModelStore | null = null;
  private db: IDBDatabase | null = null;
  private readonly STORE_NAME = 'models';
  private readonly DB_NAME = 'ModelDB';
  private readonly DB_VERSION = 1;
  private initPromise: Promise<void> | null = null;
  private isInitializing = false;
  private initializeResolvers: Array<() => void> = [];

  private constructor() {}

  static getInstance(): ModelStore {
    if (!this.instance) {
      this.instance = new ModelStore();
    }
    return this.instance;
  }

  async init(): Promise<void> {
    // Return existing promise if initialization is in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.db) {
      return Promise.resolve();
    }

    // Prevent multiple concurrent initializations
    if (this.isInitializing) {
      return new Promise(resolve => {
        this.initializeResolvers.push(resolve);
      });
    }

    this.isInitializing = true;

    try {
      this.initPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };

        request.onerror = () => {
          this.isInitializing = false;
          this.initPromise = null;
          reject(new ModelStoreError('Failed to open database', request.error));
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.isInitializing = false;
          // Resolve all pending initialization promises
          this.initializeResolvers.forEach(resolver => resolver());
          this.initializeResolvers = [];
          resolve();
        };
      });

      await this.initPromise;
    } catch (error) {
      this.initPromise = null;
      this.isInitializing = false;
      this.initializeResolvers = [];
      throw new ModelStoreError('Failed to initialize ModelStore', error);
    }
  }

  async storeModel(file: File): Promise<string> {
    try {
      if (!this.db) throw new ModelStoreError('Database not initialized');
      console.log('Storing GLB model:', { 
        name: file.name,
        originalSize: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });

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

      const id = crypto.randomUUID();
      console.log('Generated model ID:', id);

      const asset: ModelAsset = {
        id,
        data: buffer,
        timestamp: Date.now(),
        originalName: file.name,
        size: buffer.byteLength,
        meshes: [] // Will be populated when loading
      };

      return new Promise<string>((resolve, reject) => {
        const transaction = this.db!.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put(asset);

        request.onsuccess = () => {
          console.log('Model stored successfully:', {
            id,
            name: file.name,
            size: buffer.byteLength
          });
          resolve(id);
        };

        request.onerror = () => {
          console.error('Failed to store model:', request.error);
          reject(new ModelStoreError('Failed to store model', request.error));
        };
      });

    } catch (error) {
      console.error('Error storing model:', error);
      throw new ModelStoreError('Failed to store model', error);
    }
  }

  async loadModel(modelId: string): Promise<THREE.Object3D | null> {
    try {
      const asset = await this.getModelAsset(modelId);
      if (!asset || !asset.data) {
        throw new ModelStoreError('Model asset not found or invalid');
      }

      // Verify file signature for GLB
      const header = new Uint8Array(asset.data.slice(0, 4));
      const isGLB = header[0] === 0x67 && header[1] === 0x6C && 
                    header[2] === 0x54 && header[3] === 0x46; // "glTF"
      
      if (!isGLB) {
        throw new ModelStoreError('Invalid GLB file format');
      }

      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      const gltf = await loader.parseAsync(asset.data, '');
      
      // Calculate compressed size by traversing meshes
      let totalVertices = 0;
      let totalTriangles = 0;
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const position = child.geometry.getAttribute('position');
          if (position) {
            totalVertices += position.count;
            if (child.geometry.index) {
              totalTriangles += child.geometry.index.count / 3;
            } else {
              totalTriangles += position.count / 3;
            }
          }
        }
      });

      console.log('GLB Model Metrics:', {
        name: asset.originalName,
        originalSize: (asset.size / 1024 / 1024).toFixed(2) + ' MB',
        vertices: totalVertices.toLocaleString(),
        triangles: totalTriangles.toLocaleString(),
        meshCount: gltf.scene.children.filter(c => c instanceof THREE.Mesh).length
      });

      const model = gltf.scene;
      
      // Set model name to original filename
      model.name = asset.originalName;
      
      console.log('GLTFLoader result:', {
        modelId,
        isGLB,
        meshCount: gltf.scene.children.filter(c => c instanceof THREE.Mesh).length
      });
      
      // Set GLB flags on root object FIRST
      model.userData = {
        ...model.userData,
        modelId,
        isGLBModel: true,
        objectType: 'GLB Model',
        originalName: asset.originalName
      };

      // Log model flags after setting
      console.log('Model flags set:', {
        id: modelId,
        isGLBModel: model.userData.isGLBModel,
        objectType: model.userData.objectType
      });
      console.log('Loading GLB model:', {
        id: modelId,
        name: asset.originalName,
        meshCount: model.children.filter(c => c instanceof THREE.Mesh).length
      });

      // Process ALL nodes in hierarchy
      const cleanupMaterials = new Set<THREE.Material>();
      model.traverse((child) => {
        // Set GLB flags on EVERY node
        child.userData = {
          ...child.userData,
          modelId,
          isGLBModel: true,
          objectType: 'GLB Model'
        };

        // Log GLB flags on each mesh
        if (child instanceof THREE.Mesh) {
          console.log('Setting GLB flags on mesh:', {
            id: child.uuid.slice(0,8),
            isGLB: child.userData.isGLBModel,
            objectType: child.userData.objectType
          });
        }

        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Configure materials for shadows
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat instanceof THREE.Material) {
                mat.shadowSide = THREE.FrontSide;
              }
            });
          } else if (child.material instanceof THREE.Material) {
            child.material.shadowSide = THREE.FrontSide;
          }
          
          if (!(child.material instanceof THREE.MeshStandardMaterial)) {
            const oldMaterial = child.material;
            const newMaterial = createStandardMaterial({
              color: oldMaterial.color?.getHexString() || '#4a4a4a',
              metalness: 0.1,
              roughness: 0.7,
              shadowSide: THREE.FrontSide
            });
            cleanupMaterials.add(oldMaterial);
            child.material = newMaterial;
          }
        }
      });

      // Center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.set(-center.x, 0.5 - center.y, -center.z);
      model.position.y = 0.5;

      // Setup physics after all flags are set
      setupPhysicsForMesh(model);

      // Cleanup
      cleanupMaterials.forEach(material => material.dispose());

      console.log('GLB model loaded successfully:', {
        id: modelId,
        name: asset.originalName,
        isGLB: true,
        userData: model.userData
      });

      return model;
    } catch (error) {
      console.error('Error loading model:', error);
      return null;
    }
  }

  private async getModelAsset(id: string): Promise<ModelAsset | null> {
    if (!this.db) throw new ModelStoreError('Database not initialized');

    console.log('Fetching model asset by ID:', id);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME);
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        console.log('Model asset fetch result:', {
          found: !!result,
          id,
          name: result?.originalName,
          size: result?.size
        });
        if (!result) {
          console.warn('Model asset not found:', id);
        }
        resolve(result || null);
      };
      
      request.onerror = () => {
        console.error('Failed to get model asset:', request.error);
        reject(new ModelStoreError('Failed to get model asset', request.error));
      };
    });
  }

  dispose(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
      this.isInitializing = false;
      this.initializeResolvers = [];
    }
  }
}