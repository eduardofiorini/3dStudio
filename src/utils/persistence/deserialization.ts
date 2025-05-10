import * as THREE from 'three';
import { SerializedObject, SerializedMaterial } from './types';
import { 
  createCube, createSphere, createCylinder, createCone, createTorus, createPlane, 
  createText, createMediaPlane, createDirectionalLight, createAmbientLight,
  createPointLight, createRectAreaLight 
} from '../objects';
import { reloadGLBModel } from '../objects/modelLoader';

export function deserializeMaterial(mesh: THREE.Mesh, materialData: SerializedMaterial) {
  if (!(mesh.material instanceof THREE.MeshStandardMaterial)) return;

  // Create the appropriate material type
  let newMaterial: THREE.Material;
  
  // Log incoming material data
  console.log('Deserializing material:', {
    type: materialData.type,
    opacity: materialData.opacity ?? 1,
    transparent: materialData.transparent
  });

  switch (materialData.type) {
    case 'physical':
      newMaterial = new THREE.MeshPhysicalMaterial({
        color: materialData.color || '#ffffff',
        emissive: new THREE.Color(materialData.emissive || '#000000'),
        emissiveIntensity: materialData.emissiveIntensity || 0,
        metalness: materialData.metalness || 0,
        roughness: materialData.roughness || 0,
        transmission: materialData.transmission ?? 0, // Use nullish coalescing
        thickness: materialData.thickness || 0,
        ior: materialData.ior || 1.5,
        opacity: typeof materialData.opacity === 'number' ? materialData.opacity : 1,
        transparent: materialData.transparent || materialData.opacity < 1
      });
      console.log('Physical material created with transmission:', 
        materialData.transmission ?? 0);
      break;
      
    case 'hider':
      newMaterial = new THREE.MeshStandardMaterial({
        colorWrite: false,
        side: THREE.DoubleSide,
        transparent: false,
        depthWrite: true,
        depthTest: true
      });
      mesh.renderOrder = -100;
      break;
    case 'shadow':
      newMaterial = new THREE.ShadowMaterial({
        opacity: materialData.opacity ?? 0.4,
        transparent: true
      });
      newMaterial.side = THREE.FrontSide;
      newMaterial.castShadow = false;
      break;
      
    case 'standard':
    default:
      newMaterial = new THREE.MeshStandardMaterial({
        color: materialData.color || '#636363',
        emissive: new THREE.Color(materialData.emissive || '#000000'),
        emissiveIntensity: materialData.emissiveIntensity || 0,
        metalness: materialData.metalness || 0,
        roughness: materialData.roughness || 0.7,
        opacity: typeof materialData.opacity === 'number' ? materialData.opacity : 1,
        transparent: materialData.transparent || materialData.opacity < 1
      });
  }

  // Dispose of old material
  if (mesh.material) {
    mesh.material.dispose();
  }

  // Assign new material
  mesh.material = newMaterial;


  // Debug log to verify material after update
  console.log('Material after update:', {
    type: materialData.type,
    metalness: newMaterial instanceof THREE.MeshStandardMaterial ? newMaterial.metalness : 'N/A',
    roughness: newMaterial instanceof THREE.MeshStandardMaterial ? newMaterial.roughness : 'N/A',
    emissiveIntensity: newMaterial instanceof THREE.MeshStandardMaterial ? newMaterial.emissiveIntensity : 'N/A'
  });
}

export async function deserializeObject(objData: SerializedObject): Promise<THREE.Object3D | null> {
  // Add small delay to prevent race conditions
  await new Promise(resolve => setTimeout(resolve, 500));

  // Skip unknown object types
  if (!objData.objectType) {
    console.warn('Missing object type:', objData);
    return null;
  }

  let object: THREE.Object3D | null = null;

  // Handle text objects
  if (objData.objectType === '2D Text' || objData.objectType === '3D Text') {
    if (!objData.textOptions) return null;
    object = await createText({
      text: objData.textOptions.text,
      size: objData.textOptions.size,
      height: objData.textOptions.height,
      is3D: objData.objectType === '3D Text',
      font: objData.textOptions.font,
      material: objData.material
    });
  }
  // Handle media objects
  else if (objData.objectType === 'Image' || objData.objectType === 'Video') {
    if (!objData.mediaOptions?.mediaId) {
      console.warn('Missing media ID:', objData);
      return null;
    }
    object = await createMediaPlane({ id: objData.mediaOptions.mediaId });
  }
// Handle GLB models - update this section
else if (
  objData.objectType === 'GLB Model' || 
  (objData.type === 'Group' && objData.userData?.isGLBModel)
) {
  console.log('Deserializing GLB model:', {
    type: objData.type,
    objectType: objData.objectType,
    isGLBModel: objData.userData?.isGLBModel,
    modelId: objData.modelId || objData.userData?.modelId
  });

  try {
    // Get modelId from all possible locations
    const modelId = objData.modelId || 
                   objData.userData?.modelId || 
                   objData.glbOptions?.modelId;

    if (!modelId) {
      console.warn('Missing modelId for GLB model');
      return null;
    }

    object = await reloadGLBModel(modelId);

    if (!object) {
      console.warn('Failed to reload GLB model:', modelId);
      return null;
    }

    if (object) {
      const originalName = objData.name || 
                          objData.originalName || 
                          objData.userData?.originalName || 
                          objData.glbOptions?.originalName || 
                          'untitled.glb';

      // Set the object name
      object.name = originalName;

      // Set consistent metadata
      object.userData = {
        ...object.userData,
        isGLBModel: true,
        modelId: modelId,
        objectType: 'GLB Model',
        originalName: originalName
      };

      // Process children (your existing traverse code)
      object.traverse(child => {
        if (child instanceof THREE.Mesh) {
          // Enable shadows for all meshes
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Ensure materials are configured for shadows
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat instanceof THREE.Material) {
                mat.shadowSide = THREE.FrontSide;
              }
            });
          } else if (child.material instanceof THREE.Material) {
            child.material.shadowSide = THREE.FrontSide;
          }

          child.userData = {
            ...child.userData,
            isGLBModel: true,
            modelId: modelId,
            objectType: 'GLB Model'
          };
        }
      });
      
      // Restore materials and physics settings
      object.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (!(child.material instanceof THREE.MeshStandardMaterial)) {
            child.material = new THREE.MeshStandardMaterial({
              color: '#4a4a4a',
              metalness: 0.1,
              roughness: 0.7
            });
          }
        }
      });
      
      // Log successful restoration
      console.log('GLB model restored:', {
        id: modelId,
        name: originalName,
        userData: object.userData
      });
    }
  } catch (error) {
    console.error('Error deserializing GLB model:', error);
    return null;
  }
  }
  // Handle primitive objects
  else {
    // Handle lights
    if (objData.lightProperties?.type) {
      console.log('Deserializing light:', objData.lightProperties);
      switch (objData.lightProperties.type) {
        case 'Directional Light':
          object = createDirectionalLight({
            color: objData.lightProperties.color,
            intensity: objData.lightProperties.intensity,
            position: {
              x: objData.position[0],
              y: objData.position[1],
              z: objData.position[2]
            }
          });
          object.userData.isLight = true;
          object.userData.objectType = 'Directional Light';
          break;
        case 'Ambient Light':
          object = createAmbientLight({
            color: objData.lightProperties.color,
            intensity: objData.lightProperties.intensity
          });
          object.userData.isLight = true;
          object.userData.objectType = 'Ambient Light';
          break;
        case 'Point Light':
          object = createPointLight({
            color: objData.lightProperties.color,
            intensity: objData.lightProperties.intensity,
            distance: objData.lightProperties.distance,
            decay: objData.lightProperties.decay,
            position: {
              x: objData.position[0],
              y: objData.position[1],
              z: objData.position[2]
            }
          });
          object.userData.isLight = true;
          object.userData.objectType = 'Point Light';
          break;
        case 'Rect Area Light':
          object = createRectAreaLight({
            color: objData.lightProperties.color,
            intensity: objData.lightProperties.intensity,
            width: objData.lightProperties.width,
            height: objData.lightProperties.height,
            position: {
              x: objData.position[0],
              y: objData.position[1],
              z: objData.position[2]
            }
          });
          object.userData.isLight = true;
          object.userData.objectType = 'Rect Area Light';
          break;
      }
      console.log('Light created:', {
        type: object?.userData.objectType,
        isLight: object?.userData.isLight
      });
    } else {
      // Handle non-light objects
      object = await createObjectFromType(objData.objectType);
    }
  }

  if (!object) return null;

  // Restore transform
  if (!objData.position || !objData.rotation || !objData.scale) {
    console.warn('Missing transform data:', objData);
    return null;
  }

  object.position.fromArray(objData.position);
  object.rotation.fromArray(objData.rotation);
  object.scale.fromArray(objData.scale);

  // Restore material
  if (objData.material && object instanceof THREE.Mesh) {
    deserializeMaterial(object, objData.material);
  }

  // Restore light properties
  if (objData.lightProperties && object instanceof THREE.Light) {
    if (objData.lightProperties.color) {
      object.color.set(objData.lightProperties.color);
    }
    if (typeof objData.lightProperties.intensity === 'number') {
      object.intensity = objData.lightProperties.intensity;
    }
    if (object instanceof THREE.PointLight) {
      if (typeof objData.lightProperties.distance === 'number') {
        object.distance = objData.lightProperties.distance;
      }
      if (typeof objData.lightProperties.decay === 'number') {
        object.decay = objData.lightProperties.decay;
      }
    }
    if (object instanceof THREE.RectAreaLight) {
      if (typeof objData.lightProperties.width === 'number') {
        object.width = objData.lightProperties.width;
      }
      if (typeof objData.lightProperties.height === 'number') {
        object.height = objData.lightProperties.height;
      }
    }
  }


  // Restore user data
  object.userData = {
    ...objData.userData,
    objectType: objData.objectType, // Ensure objectType is preserved
    physicsEnabled: objData.userData?.physicsEnabled || false,
    physicsType: objData.userData?.physicsType || 'dynamic'
  };

  // Restore initial transform if it exists
  if (objData.userData?.initialTransform) {
    object.userData.initialTransform = {
      position: new THREE.Vector3().fromArray(objData.userData.initialTransform.position),
      rotation: new THREE.Euler().fromArray(objData.userData.initialTransform.rotation),
      scale: new THREE.Vector3().fromArray(objData.userData.initialTransform.scale)
    };
  }

  // Log deserialized object state
  console.log('Deserialized object:', {
    type: object.type,
    userData: {
      isGLBModel: object.userData.isGLBModel,
      modelId: object.userData.modelId,
      objectType: object.userData.objectType
    }
  });
  return object;
}

async function createObjectFromType(type: string): Promise<THREE.Object3D | null> {
  switch (type) {
    case 'DirectionalLight':
      return createDirectionalLight();
    case 'AmbientLight':
      return createAmbientLight();
    case 'PointLight':
      return createPointLight();
    case 'RectAreaLight':
      return createRectAreaLight();
    case 'BoxGeometry':
    case 'Cube':
      return createCube({ 
        position: { y: 0 },
        material: { color: '#636363' }
      });
    case 'SphereGeometry':
    case 'Sphere':
      return createSphere();
    case 'CylinderGeometry':
    case 'Cylinder':
      return createCylinder();
    case 'ConeGeometry':
    case 'Cone':
      return createCone();
    case 'TorusGeometry':
    case 'Torus':
      return createTorus();
    case 'PlaneGeometry':
    case 'Plane':
      return createPlane();
    default:
      console.warn('Unknown object type:', type);
      return null;
  }
}