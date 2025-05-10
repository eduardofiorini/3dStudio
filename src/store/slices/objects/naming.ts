import { Object3D } from 'three';
import { EditorState } from '../../types';

export function generateObjectName(object: Object3D, get: () => EditorState): string {
  // Get the base type name
  let baseType = object.type === 'Mesh'
    ? (object.userData.objectType || object.geometry.type.replace('Geometry', '')).toLowerCase()
    : object.type.toLowerCase();

  // Capitalize first letter
  baseType = baseType.charAt(0).toUpperCase() + baseType.slice(1);
  
  // Count existing objects of this type
  const existingObjects = get().objects.filter(obj => {
    const objName = get().objectNames.get(obj);
    if (!objName) return false;
    return objName.toLowerCase().startsWith(baseType.toLowerCase());
  });
  
  // If this is the first object of its type, use the base name without number
  return existingObjects.length === 0 
    ? baseType 
    : `${baseType}${existingObjects.length + 1}`;
}