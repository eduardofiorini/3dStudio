import { PointLight } from 'three';
import { useEditorStore } from '../../../store/editorStore';

interface PointLightControlsProps {
  light: PointLight;
}

export function PointLightControls({ light }: PointLightControlsProps) {
  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Distance</label>
          <span className="text-xs text-gray-400">{light.distance.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="40"
          step="0.1"
          value={light.distance}
          onChange={(e) => {
            light.distance = parseFloat(e.target.value);
            useEditorStore.getState().updateTransform();
          }}
          className="w-full h-1.5 mt-1"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Decay</label>
          <span className="text-xs text-gray-400">{light.decay.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={light.decay}
          onChange={(e) => {
            light.decay = parseFloat(e.target.value);
            useEditorStore.getState().updateTransform();
          }}
          className="w-full h-1.5 mt-1"
        />
      </div>
    </>
  );
}