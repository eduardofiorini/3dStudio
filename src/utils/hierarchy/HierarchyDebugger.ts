import { Object3D } from 'three';

interface HierarchyDebugInfo {
  action: string;
  objectId: string;
  parentId?: string;
  timestamp: number;
  details?: any;
}

export class HierarchyDebugger {
  private static history: HierarchyDebugInfo[] = [];
  private static enabled = true;

  static enable() {
    this.enabled = true;
  }

  static disable() {
    this.enabled = false;
  }

  static logObjectRemoval(object: Object3D, parent: Object3D | null, children: Set<Object3D> | undefined) {
    if (!this.enabled) return;

    this.history.push({
      action: 'objectRemoval',
      objectId: object.uuid,
      parentId: parent?.uuid,
      timestamp: Date.now(),
      details: {
        objectName: object.name || object.uuid,
        objectType: object.type,
        childrenCount: children?.size || 0,
        childrenIds: Array.from(children || []).map(child => child.uuid)
      }
    });

    console.debug('[Hierarchy] Object removed:', {
      object: object.name || object.uuid,
      parent: parent?.name || parent?.uuid,
      childrenCount: children?.size || 0
    });
  }

  static logParentChange(child: Object3D, oldParent: Object3D | null, newParent: Object3D | null) {
    if (!this.enabled) return;

    this.history.push({
      action: 'parentChange',
      objectId: child.uuid,
      parentId: newParent?.uuid,
      timestamp: Date.now(),
      details: {
        oldParentId: oldParent?.uuid,
        objectName: child.name || child.uuid,
        objectType: child.type
      }
    });
  }

  static getHistory() {
    return this.history;
  }

  static clearHistory() {
    this.history = [];
  }
}