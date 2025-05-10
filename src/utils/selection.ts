import * as THREE from 'three';
import { Camera, Scene } from 'three';

export interface Point2D {
  x: number;
  y: number;
}

export function getObjectsInSelectionBox(
  startPoint: Point2D,
  endPoint: Point2D,
  camera: Camera,
  scene: Scene,
  domElement: HTMLElement
): THREE.Object3D[] {
  // Convert screen coordinates to normalized device coordinates
  const rect = domElement.getBoundingClientRect();
  const startNdc = {
    x: ((startPoint.x - rect.left) / rect.width) * 2 - 1,
    y: -((startPoint.y - rect.top) / rect.height) * 2 + 1
  };
  const endNdc = {
    x: ((endPoint.x - rect.left) / rect.width) * 2 - 1,
    y: -((endPoint.y - rect.top) / rect.height) * 2 + 1
  };

  // Create selection box
  const selectionBox = new THREE.Box2(
    new THREE.Vector2(Math.min(startNdc.x, endNdc.x), Math.min(startNdc.y, endNdc.y)),
    new THREE.Vector2(Math.max(startNdc.x, endNdc.x), Math.max(startNdc.y, endNdc.y))
  );

  // Find objects in selection box
  return scene.children.filter(object => {
    if (!object.visible) return false;

    // Skip system objects and helpers
    if (object.userData.isGrid) return false;
    if (object.type === 'GridHelper') return false;
    if (object.type === 'AxesHelper') return false;
    if (object.type === 'Object3D' && !object.children.length) return false;
    if (object.userData.isHelper) return false;

    // Skip objects at origin with no user-defined properties, except lights
    const isAtOrigin = object.position.x === 0 && object.position.y === 0 && object.position.z === 0;
    if (isAtOrigin && !object.userData.isLight && Object.keys(object.userData).length === 0) return false;

    // Allow specific object types and lights
    const validTypes = ['Mesh', 'Points', 'Group', 'Scene', 'AmbientLight', 'DirectionalLight', 'PointLight', 'RectAreaLight'];
    if (!validTypes.includes(object.type)) return false;

    // Skip internal objects
    if (object.name.startsWith('__')) return false;

    // Convert object position to screen space
    const vector = new THREE.Vector3();
    vector.setFromMatrixPosition(object.matrixWorld);
    vector.project(camera);

    // Skip invalid positions
    if (!Number.isFinite(vector.x) || !Number.isFinite(vector.y)) return false;

    return selectionBox.containsPoint(new THREE.Vector2(vector.x, vector.y));
  });
}