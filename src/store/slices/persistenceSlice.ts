import { StateCreator } from 'zustand';
import { EditorState } from '../types';
import { SerializedScene } from '../../utils/persistence/types';
import { serializeObject } from '../../utils/persistence/serialization';
import { deserializeObject } from '../../utils/persistence/deserialization';

const STORAGE_KEY = 'editor_scene_data';

export interface PersistenceSlice {
  saveScene: () => void;
  loadScene: () => void;
  clearSavedScene: () => void;
  clearDatabases: () => Promise<void>;
  hasSavedScene: () => boolean;
  getLastSaveDate: () => string | null;
}

async function clearSpecificDatabases(): Promise<void> {
  try {
    const dbsToDelete = [
      {
        name: 'MediaDB',
        stores: ['media']
      },
      {
        name: 'ModelDB',
        stores: ['models', 'textures']
      }
    ];

    for (const db of dbsToDelete) {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(db.name);
        
        request.onsuccess = () => {
          console.log(`Cleared ${db.name} with stores: ${db.stores.join(', ')}`);
          resolve();
        };
        
        request.onerror = () => {
          console.error(`Failed to clear ${db.name}`);
          reject();
        };
      });
    }

    console.log('Media and Model databases cleared');
  } catch (error) {
    console.error('Error clearing databases:', error);
    throw error;
  }
}
export const createPersistenceSlice: StateCreator<EditorState, [], [], PersistenceSlice> = (set, get) => ({
  saveScene: () => {
    try {
      const objects = get().objects;
      
      // Log scene state before saving
      console.group('Saving Scene State');
      console.log('Active Objects:', objects.map(obj => ({
        type: obj.userData.objectType || obj.type,
        id: obj.uuid.slice(0, 8),
        isGLB: obj.userData.isGLBModel || false,
        hasPhysics: obj.userData.physicsEnabled || false,
        position: obj.position.toArray().map(v => v.toFixed(2))
      })));
      
      const sceneSettings = get().sceneSettings;
      const materialAssets = get().materialAssets;
      const shaderAssets = get().shaderAssets;
      
      // Log assets being saved
      console.log('Material Assets:', materialAssets.map(asset => ({
        id: asset.id.slice(0, 8),
        name: asset.name,
        users: asset.users.size
      })));
      
      console.log('Shader Assets:', shaderAssets.map(asset => ({
        id: asset.id.slice(0, 8),
        name: asset.name,
        users: asset.users.size
      })));
      
      // Serialize scene data
      const sceneData: SerializedScene = {
        objects: objects.map(serializeObject),
        sceneSettings,
        materialAssets: materialAssets.map(asset => ({
          id: asset.id,
          name: asset.name,
          material: serializeMaterial(asset.material),
          users: Array.from(asset.users).map(obj => obj.uuid)
        })),
        shaderAssets: shaderAssets.map(asset => ({
          id: asset.id,
          name: asset.name,
          vertexShader: asset.vertexShader,
          fragmentShader: asset.fragmentShader,
          users: Array.from(asset.users).map(obj => obj.uuid)
        })),
        version: '1.0'
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(sceneData));
      localStorage.setItem(`${STORAGE_KEY}_date`, new Date().toISOString());
      
      console.log('Scene saved successfully at', new Date().toLocaleString());
      console.groupEnd();
    } catch (error) {
      console.error('Error saving scene:', error);
    }
  },

  loadScene: () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) {
        console.warn('No saved scene data found');
        return;
      }

      // Track GLB loading attempts
      let retryCount = 0;
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 500; // ms

      console.group('Loading Scene State');
      const sceneData: SerializedScene = JSON.parse(savedData);
      
      // Log what we're about to load
      console.log('Loading Objects:', sceneData.objects.map(obj => ({
        type: obj.objectType,
        isGLB: obj.glbOptions ? true : false,
        hasPhysics: obj.userData?.physicsEnabled || false
      })));
      
      console.log('Loading Material Assets:', sceneData.materialAssets?.length || 0);
      console.log('Loading Shader Assets:', sceneData.shaderAssets?.length || 0);
      
      // Clear existing scene
      const currentObjects = [...get().objects];
      console.log('Clearing current objects:', currentObjects.length);
      
      currentObjects.forEach(obj => {
        if (obj.parent) {
          obj.parent.remove(obj);
        }
      });

      set({ 
        objects: [],
        hasInitialized: true
      });

      // Load scene settings
      set({ sceneSettings: sceneData.sceneSettings });

      // Clear existing assets
      set({ 
        materialAssets: [],
        shaderAssets: []
      });

      // Recreate objects
      const loadObjects = async () => {
        try {
          const objects = await Promise.all(sceneData.objects.map(async (objData) => {
            try {
              console.log('Deserializing object:', {
                type: objData.objectType,
                glb: objData.glbOptions?.modelId || null,
                media: objData.mediaOptions?.mediaId || null
              });
              return await deserializeObject(objData);
            } catch (error) {
              console.error('Failed to deserialize object:', error);
              return null;
            }
          }));

          const validObjects = objects.filter(Boolean);
          
          // Check if we need to retry due to GLB loading failures
          const hasGLBs = sceneData.objects.some(obj => obj.objectType === 'GLB Model');
          const loadedGLBs = validObjects.filter(obj => obj?.userData.isGLBModel).length;
          const expectedGLBs = sceneData.objects.filter(obj => obj.objectType === 'GLB Model').length;

          if (hasGLBs && loadedGLBs < expectedGLBs && retryCount < MAX_RETRIES) {
            console.log(`Retrying GLB load (${retryCount + 1}/${MAX_RETRIES}):`, {
              loaded: loadedGLBs,
              expected: expectedGLBs
            });
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return loadObjects(); // Retry recursively
          }

          return validObjects;
        } catch (error) {
          console.error('Error loading objects:', error);
          return [];
        }
      };

      loadObjects().then(validObjects => {
        console.log('Successfully loaded objects:', validObjects.length);
        
        // Restore material assets
        if (sceneData.materialAssets) {
          const restoredMaterialAssets = sceneData.materialAssets.map(assetData => {
            const users = new Set(
              assetData.users
                .map(uuid => validObjects.find(obj => obj.uuid === uuid))
                .filter(Boolean)
            );
            return {
              ...assetData,
              users
            };
          });
          set({ materialAssets: restoredMaterialAssets });
          console.log('Restored material assets:', restoredMaterialAssets.length);
        }

        // Restore shader assets
        if (sceneData.shaderAssets) {
          const restoredShaderAssets = sceneData.shaderAssets.map(assetData => {
            const users = new Set(
              assetData.users
                .map(uuid => validObjects.find(obj => obj.uuid === uuid))
                .filter(Boolean)
            );
            return {
              ...assetData,
              users
            };
          });
          set({ shaderAssets: restoredShaderAssets });
          console.log('Restored shader assets:', restoredShaderAssets.length);
        }

        if (validObjects.length === 0) {
          console.warn('No valid objects loaded from scene data');
        }
        get().setObjects(validObjects);
        console.log('Scene loaded successfully at', new Date().toLocaleString());
        console.groupEnd();
      });

    } catch (error) {
      console.error('Error loading scene:', error);
    }
  },

  clearSavedScene: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}_date`);
    get().clearDatabases();
  },

  clearDatabases: async () => {
    try {
      await clearSpecificDatabases();
      window.location.reload(); // Reload to reset state
    } catch (error) {
      console.error('Failed to clear databases:', error);
    }
  },

  hasSavedScene: () => {
    return !!localStorage.getItem(STORAGE_KEY);
  },

  getLastSaveDate: () => {
    return localStorage.getItem(`${STORAGE_KEY}_date`);
  }
});