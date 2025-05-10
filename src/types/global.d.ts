import { Object3D } from 'three';

declare global {
  interface Window {
    __THREE_OBJECTS?: Object3D[];
    THREE: typeof import('three');
  }