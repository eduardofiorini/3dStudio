import { SerializedObject } from '../types';
import { createText } from '../../objects';

export async function deserializeText(objData: SerializedObject): Promise<THREE.Object3D | null> {
  if (!objData.textOptions) {
    console.warn('Missing text options:', objData);
    return null;
  }

  return createText({
    text: objData.textOptions.text,
    size: objData.textOptions.size,
    height: objData.textOptions.height,
    is3D: objData.objectType === '3D Text',
    font: objData.textOptions.font,
    material: objData.material
  });
}