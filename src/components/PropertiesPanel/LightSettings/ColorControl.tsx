import { Color } from 'three';
import { useEditorStore } from '../../../store/editorStore';

interface ColorControlProps {
  color: Color;
  onUpdateHelper?: (color: string) => void;
}

export function ColorControl({ color, onUpdateHelper }: ColorControlProps) {
  return (
    <div>
      <label className="text-xs text-gray-400 block mb-1">Color</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={`#${color.getHexString()}`}
          onChange={(e) => {
            color.set(e.target.value);
            onUpdateHelper?.(e.target.value);
            useEditorStore.getState().updateTransform();
          }}
          className="w-8 h-8 rounded cursor-pointer"
        />
        <input
          type="text"
          value={`#${color.getHexString()}`}
          onChange={(e) => {
            color.set(e.target.value);
            onUpdateHelper?.(e.target.value);
            useEditorStore.getState().updateTransform();
          }}
          className="flex-1 py-0.5 px-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200"
        />
      </div>
    </div>
  );
}