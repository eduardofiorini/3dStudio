import { Vector3, Euler } from 'three';

export interface TransformData {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}

export type TransformType = 'position' | 'rotation' | 'scale';
export type Axis = 'x' | 'y' | 'z';

export interface TransformUpdate {
  type: TransformType;
  axis: Axis;
  value: number;
}