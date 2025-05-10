import { Object3D } from 'three';

export interface HierarchyNode {
  object: Object3D;
  children: HierarchyNode[];
  depth: number;
  isVisible: boolean;
  isLocked: boolean;
  isExpanded: boolean;
}

export interface HierarchyState {
  expandedNodes: Set<string>;
  visibilityState: Map<string, boolean>;
  lockState: Map<string, boolean>;
}

export interface DragState {
  isDragging: boolean;
  draggedObject: Object3D | null;
  dropTarget: Object3D | null;
}

export type HierarchyChangeHandler = (object: Object3D) => void;