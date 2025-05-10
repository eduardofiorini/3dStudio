import React, { useState } from 'react';
import { TextOptions } from '../../utils/objects/text';

interface TextDialogProps {
  onClose: () => void;
  onAdd: (options: TextOptions) => void;
}

export default function TextDialog({ onClose, onAdd }: TextDialogProps) {
  const [text, setText] = useState('Text');
  const [size, setSize] = useState(1);
  const [height, setHeight] = useState(0.2);
  const [is3D, setIs3D] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      text,
      size,
      height: is3D ? height : 0,
      is3D,
      material: {
        color: '#4a4a4a',
        metalness: 0,
        roughness: 0.4
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#252526] rounded-lg shadow-xl w-96 p-4">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Add Text</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Size</label>
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              step={0.1}
              min={0.1}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-200"
            />
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={is3D}
                onChange={(e) => setIs3D(e.target.checked)}
                className="rounded border-gray-700"
              />
              <span className="text-sm text-gray-400">3D Text</span>
            </label>
          </div>
          {is3D && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Depth</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                step={0.1}
                min={0.1}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-200"
              />
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:bg-gray-700/50 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}