import { Object3D } from 'three';
import { HierarchyNode, HierarchyState } from './types';

export class HierarchyManager {
  private state: HierarchyState = {
    expandedNodes: new Set(),
    visibilityState: new Map(),
    lockState: new Map()
  };

  buildHierarchyTree(
    objects: Object3D[],
    objectParents: Map<Object3D, Object3D>,
    depth: number = 0
  ): HierarchyNode[] {
    // Filter top-level objects
    const topLevel = objects.filter(obj => !objectParents.has(obj));

    // Sort objects - lights first, then others
    topLevel.sort((a, b) => {
      if (a.userData.isLight && !b.userData.isLight) return -1;
      if (!a.userData.isLight && b.userData.isLight) return 1;
      return 0;
    });

    // Build tree recursively
    return topLevel.map(obj => this.createNode(obj, objectParents, depth));
  }

  private createNode(
    object: Object3D,
    objectParents: Map<Object3D, Object3D>,
    depth: number
  ): HierarchyNode {
    const children = Array.from(objectParents.entries())
      .filter(([_, parent]) => parent === object)
      .map(([child]) => this.createNode(child, objectParents, depth + 1));

    return {
      object,
      children,
      depth,
      isVisible: this.state.visibilityState.get(object.uuid) ?? true,
      isLocked: this.state.lockState.get(object.uuid) ?? false,
      isExpanded: this.state.expandedNodes.has(object.uuid)
    };
  }

  toggleNodeExpanded(objectId: string): void {
    if (this.state.expandedNodes.has(objectId)) {
      this.state.expandedNodes.delete(objectId);
    } else {
      this.state.expandedNodes.add(objectId);
    }
  }

  toggleVisibility(objectId: string): void {
    const currentState = this.state.visibilityState.get(objectId) ?? true;
    this.state.visibilityState.set(objectId, !currentState);
  }

  toggleLock(objectId: string): void {
    const currentState = this.state.lockState.get(objectId) ?? false;
    this.state.lockState.set(objectId, !currentState);
  }

  isNodeExpanded(objectId: string): boolean {
    return this.state.expandedNodes.has(objectId);
  }

  isVisible(objectId: string): boolean {
    return this.state.visibilityState.get(objectId) ?? true;
  }

  isLocked(objectId: string): boolean {
    return this.state.lockState.get(objectId) ?? false;
  }

  reset(): void {
    this.state.expandedNodes.clear();
    this.state.visibilityState.clear();
    this.state.lockState.clear();
  }
}