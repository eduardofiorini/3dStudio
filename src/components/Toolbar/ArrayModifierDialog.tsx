import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ArrayModifierDialogProps {
  onClose: () => void;
}

export function ArrayModifierDialog({ onClose }: ArrayModifierDialogProps) {
  const objects = useEditorStore((state) => state.objects);
  const addObject = useEditorStore((state) => state.addObject);
  const getObjectName = useEditorStore((state) => state.getObjectName);
  const [selectedObjectId, setSelectedObjectId] = useState<string>('');
  const [gridSize, setGridSize] = useState({ x: 3, y: 3 });
  const [spacing, setSpacing] = useState(1.5);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const updatePreviewObjects = useEditorStore((state) => state.updatePreviewObjects);
  const clearPreviewObjects = useEditorStore((state) => state.clearPreviewObjects);

  const handleCreate = () => {
    const sourceObject = objects.find(obj => obj.uuid === selectedObjectId);
    if (!sourceObject) return;
    const store = useEditorStore.getState();
    useEditorStore.getState().createArrayGrid(sourceObject, gridSize, spacing, position);
    onClose();
  };

  return (
    <div className="w-[250px] bg-[#252526]/90 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 p-3 space-y-2.5">
      <div className="flex justify-between items-start">
        <h2 className="text-sm font-medium text-gray-200">Grid Array</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700/50 rounded-md text-gray-400 hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Source Object */}
        <div>
          <label className="text-[11px] text-gray-400 block mb-1">Source Object</label>
          <select
            value={selectedObjectId}
            onChange={(e) => setSelectedObjectId(e.target.value)}
            className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
          >
            <option value="">Select an object...</option>
            {objects.map((obj) => (
              <option key={obj.uuid} value={obj.uuid}>
                {getObjectName(obj)}
              </option>
            ))}
          </select>
        </div>

        {/* Grid Size */}
        <div className={cn(!selectedObjectId && "opacity-50 pointer-events-none")}>
          <label className="text-[11px] text-gray-400 block mb-1.5">Grid Size</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Width (X)</label>
              <input
                type="number"
                value={gridSize.x}
                onChange={(e) => {
                  const value = Math.max(0, Math.min(20, parseInt(e.target.value) || 0));
                  setGridSize({ ...gridSize, x: value });
                }}
                min={0}
                max={20}
                placeholder=""
                className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Height (Z)</label>
              <input
                type="number"
                value={gridSize.y}
                onChange={(e) => {
                  const value = Math.max(0, Math.min(20, parseInt(e.target.value) || 0));
                  setGridSize({ ...gridSize, y: value });
                }}
                min={0}
                max={20}
                placeholder=""
                className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div className={cn(!selectedObjectId && "opacity-50 pointer-events-none")}>
          <label className="text-[11px] text-gray-400 block mb-1">Grid Spacing</label>
          <input
            type="number"
            value={spacing}
            onChange={(e) => {
              const value = e.target.value === '' ? '' : parseFloat(e.target.value);
              setSpacing(value);
            }}
            step={0.1}
            placeholder="1"
            className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
          />
        </div>

        {/* Position */}
        <div className={cn(!selectedObjectId && "opacity-50 pointer-events-none")}>
          <label className="text-[11px] text-gray-400 block mb-1.5">Start Position</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">X</label>
              <input
                type="number"
                value={position.x}
                onChange={(e) => setPosition({ ...position, x: parseFloat(e.target.value) })}
                step={0.1}
                className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Y</label>
              <input
                type="number"
                value={position.y}
                onChange={(e) => setPosition({ ...position, y: parseFloat(e.target.value) })}
                step={0.1}
                className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Z</label>
              <input
                type="number"
                value={position.z}
                onChange={(e) => setPosition({ ...position, z: parseFloat(e.target.value) })}
                step={0.1}
                className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClose}
          className="px-2.5 py-1 text-[11px] text-gray-400 hover:bg-gray-700/50 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!selectedObjectId}
          className={cn(
            "px-2.5 py-1 text-[11px] rounded",
            selectedObjectId
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          )}
        >
          Create Grid
        </button>
      </div>
    </div>
  );
}