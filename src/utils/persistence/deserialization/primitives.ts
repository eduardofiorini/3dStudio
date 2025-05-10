import { SerializedObject } from '../types';
import { 
  createCube, createSphere, createCylinder, 
  createCone, createTorus, createPlane 
} from '../../objects';

export async function deserializePrimitive(objData: SerializedObject): Promise<THREE.Object3D | null> {
  switch (objData.objectType) {
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
      console.warn('Unknown primitive type:', objData.objectType);
      return null;
  }
}