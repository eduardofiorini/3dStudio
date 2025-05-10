import { Object3D } from 'three';
import { Axis } from './types';

export function updatePosition(object: Object3D, axis: Axis, value: number) {
  object.position[axis] = value;
  object.updateMatrix();
}