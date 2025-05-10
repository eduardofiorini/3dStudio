import { useEditorStore } from '../../../store/editorStore';

interface IntensityControlProps {
  intensity: number;
  onChange: (value: number) => void;
  max?: number;
}

export function IntensityControl({ intensity, onChange, max = 10 }: IntensityControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-400">Intensity</label>
        <span className="text-xs text-gray-400">{intensity.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        step="0.1"
        value={intensity}
        onChange={(e) => {
          onChange(parseFloat(e.target.value));
          useEditorStore.getState().updateTransform();
        }}
        className="w-full h-1.5 mt-1"
      />
    </div>
  );
}