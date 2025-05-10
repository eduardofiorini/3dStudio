import { Object3D } from 'three';
import { Axis } from './types';

export function updateScale(object: Object3D, axis: Axis, value: number) {
  object.scale[axis] = Math.max(0.0001, value);
  object.updateMatrix();
}