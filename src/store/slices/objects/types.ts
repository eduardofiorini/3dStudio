import { Object3D } from 'three';

export interface ObjectsState {
  objects: Object3D[];
  objectNames: Map<Object3D, string>;
}

export interface ObjectsSlice extends ObjectsState {
  addObject: (object: Object3D) => void;
  removeObject: (object: Object3D) => void;
  removeObjects: (objects: Object3D[]) => void;
  duplicateObject: (object: Object3D) => void;
  renameObject: (object: Object3D, name: string) => void;
  getObjectName: (object: Object3D) => string;
}