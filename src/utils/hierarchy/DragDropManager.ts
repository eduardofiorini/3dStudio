import { Object3D } from 'three';
import { DragState } from './types';

export class DragDropManager {
  private state: DragState = {
    isDragging: false,
    draggedObject: null,
    dropTarget: null
  };

  startDrag(object: Object3D): void {
    this.state.isDragging = true;
    this.state.draggedObject = object;
  }

  updateDropTarget(target: Object3D | null): void {
    this.state.dropTarget = target;
  }

  endDrag(): { draggedObject: Object3D | null; dropTarget: Object3D | null } {
    const result = {
      draggedObject: this.state.draggedObject,
      dropTarget: this.state.dropTarget
    };

    // Reset state
    this.state.isDragging = false;
    this.state.draggedObject = null;
    this.state.dropTarget = null;

    return result;
  }

  isDragging(): boolean {
    return this.state.isDragging;
  }

  canDrop(target: Object3D): boolean {
    if (!this.state.draggedObject || !target) return false;
    
    // Prevent dropping on itself
    if (this.state.draggedObject === target) return false;
    
    // Prevent dropping on children
    let parent = target.parent;
    while (parent) {
      if (parent === this.state.draggedObject) return false;
      parent = parent.parent;
    }

    return true;
  }
}