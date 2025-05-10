import { useState, useCallback } from 'react';
import { Object3D } from 'three';
import { HierarchyManager } from '../utils/hierarchy/HierarchyManager';
import { DragDropManager } from '../utils/hierarchy/DragDropManager';
import { useEditorStore } from '../store/editorStore';

export function useHierarchy() {
  const [hierarchyManager] = useState(() => new HierarchyManager());
  const [dragDropManager] = useState(() => new DragDropManager());
  const setObjectParent = useEditorStore((state) => state.setObjectParent);

  const handleDragStart = useCallback((object: Object3D) => {
    dragDropManager.startDrag(object);
  }, [dragDropManager]);

  const handleDragOver = useCallback((target: Object3D) => {
    if (dragDropManager.canDrop(target)) {
      dragDropManager.updateDropTarget(target);
    }
  }, [dragDropManager]);

  const handleDrop = useCallback(() => {
    const { draggedObject, dropTarget } = dragDropManager.endDrag();
    if (draggedObject && dropTarget) {
      setObjectParent(draggedObject, dropTarget);
    }
  }, [dragDropManager, setObjectParent]);

  return {
    hierarchyManager,
    dragDropManager,
    handleDragStart,
    handleDragOver,
    handleDrop
  };
}