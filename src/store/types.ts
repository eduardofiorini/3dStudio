import { TransformSlice } from './slices/transformSlice';
import { ObjectsSlice } from './slices/objectsSlice';
import { SceneSlice } from './slices/sceneSlice';
import { HierarchySlice } from './slices/hierarchySlice';
import { UiSlice } from './slices/uiSlice';
import { HistorySlice } from './slices/historySlice';
import { PersistenceSlice } from './slices/persistenceSlice';
import { ArrayModifierSlice } from './slices/arrayModifierSlice';
import { RenderModeSlice } from './slices/renderModeSlice';

export type EditorState = TransformSlice & 
  ObjectsSlice & 
  SceneSlice & 
  HierarchySlice &
  UiSlice & 
  HistorySlice & 
  PersistenceSlice & 
  ArrayModifierSlice &
  RenderModeSlice;

export interface ObjectsSlice {
  hasInitialized: boolean;
  objects: Object3D[];
  objectNames: Map<Object3D, string>;
  addObject: (object: Object3D) => void;
  removeObject: (object: Object3D) => void;
  removeObjects: (objects: Object3D[]) => void;
  duplicateObject: (object: Object3D) => void;
  renameObject: (object: Object3D, name: string) => void;
  getObjectName: (object: Object3D) => string;
  setObjects: (objects: Object3D[]) => void;
}