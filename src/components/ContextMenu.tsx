import { useEffect, useRef } from 'react';
import { Copy, Trash2, Box } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function ContextMenu({ x, y, onClose, onDuplicate, onDelete }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedObjects = useEditorStore((state) => state.selectedObjects);
  const selectedCount = selectedObjects.size;
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const objects = Array.from(selectedObjects.size > 0 ? selectedObjects : [selectedObject]);
  const isPhysicsEnabled = objects.every(obj => obj?.userData.physicsEnabled);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-[#252526] rounded-md shadow-lg border border-gray-700/50 py-1 min-w-[120px] select-none"
      style={{ left: x, top: y }}
    >
      {!objects.some(obj => obj?.userData.isLight) && (
        <button
          onClick={() => {
            objects.forEach(obj => {
              if (!obj) return;
              if (isPhysicsEnabled) {
                // Clean up physics state when disabling
                obj.userData.physicsEnabled = false;
                delete obj.userData.physicsType;
                delete obj.userData.rigidBody;
                
                // Store current transform as new initial transform
                obj.userData.initialTransform = {
                  position: obj.position.clone(),
                  rotation: obj.rotation.clone(),
                  scale: obj.scale.clone()
                };
              } else {
                // Store initial transform when enabling
                obj.userData.initialTransform = {
                  position: obj.position.clone(),
                  rotation: obj.rotation.clone(),
                  scale: obj.scale.clone()
                };
                obj.userData.physicsEnabled = true;
                obj.userData.physicsType = 'dynamic';
              }
            });
            useEditorStore.getState().updateTransform();
            onClose();
          }}
          className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-700/50 flex items-center gap-2"
        >
          <Box className="w-4 h-4" />
          <span>
            {isPhysicsEnabled ? 'Disable Physics' : 'Enable Physics'}
          </span>
        </button>
      )}
      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-700/50 flex items-center gap-2 border-t border-gray-700/50"
      >
        <Copy className="w-4 h-4" />
        <span>Duplicate</span>
      </button>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-gray-700/50 flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        <span>{selectedCount > 1 ? `Delete Selected (${selectedCount})` : 'Delete'}</span>
      </button>
    </div>
  );
}