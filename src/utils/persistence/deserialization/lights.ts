import { SerializedObject } from '../types';
import { 
  createDirectionalLight, 
  createAmbientLight,
  createPointLight, 
  createRectAreaLight 
} from '../../objects';

export function deserializeLight(objData: SerializedObject): THREE.Object3D | null {
  if (!objData.lightProperties) return null;

  const { type, color, intensity, distance, decay, width, height } = objData.lightProperties;
  const position = {
    x: objData.position[0],
    y: objData.position[1],
    z: objData.position[2]
  };

  switch (type) {
    case 'Directional Light':
      return createDirectionalLight({ color, intensity, position });
    case 'Ambient Light':
      return createAmbientLight({ color, intensity });
    case 'Point Light':
      return createPointLight({ color, intensity, distance, decay, position });
    case 'Rect Area Light':
      return createRectAreaLight({ color, intensity, width, height, position });
    default:
      console.warn('Unknown light type:', type);
      return null;
  }
}