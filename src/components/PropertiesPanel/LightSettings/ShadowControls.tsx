import { Light, DirectionalLight } from 'three';
import { useEditorStore } from '../../../store/editorStore';
import { cn } from '../../../utils/cn';

interface ShadowControlsProps {
  light: Light & { shadow: any };
  isDirectionalLight?: boolean;
}

export function ShadowControls({ light, isDirectionalLight }: ShadowControlsProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={light.castShadow}
          onChange={(e) => {
            light.castShadow = e.target.checked;
            useEditorStore.getState().updateTransform();
          }}
          className={cn(
            "rounded border-gray-700",
            "focus:ring-2 focus:ring-blue-500/50",
            "checked:bg-blue-500 checked:border-blue-600"
          )}
        />
        <span className="text-xs text-gray-400">Cast Shadows</span>
      </label>

      {light.castShadow && (
        <div className="space-y-3 mt-3">
          <ShadowBiasControl light={light} />
          {isDirectionalLight && <DirectionalShadowControl light={light as DirectionalLight} />}
        </div>
      )}
    </div>
  );
}

function ShadowBiasControl({ light }: { light: Light & { shadow: any } }) {
  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Shadow Bias</label>
          <span className="text-xs text-gray-400">{light.shadow.bias.toFixed(4)}</span>
        </div>
        <input
          type="range"
          min="-0.001"
          max="0.001"
          step="0.0001"
          value={light.shadow.bias}
          onChange={(e) => {
            light.shadow.bias = parseFloat(e.target.value);
            useEditorStore.getState().updateTransform();
          }}
          className="w-full h-1.5 mt-1"
        />
      </div>
      
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Normal Bias</label>
          <span className="text-xs text-gray-400">{light.shadow.normalBias.toFixed(3)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="0.2"
          step="0.001"
          value={light.shadow.normalBias}
          onChange={(e) => {
            light.shadow.normalBias = parseFloat(e.target.value);
            useEditorStore.getState().updateTransform();
          }}
          className="w-full h-1.5 mt-1"
        />
      </div>
    </>
  );
}

function DirectionalShadowControl({ light }: { light: DirectionalLight }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-400">Shadow Blur</label>
        <span className="text-xs text-gray-400">{Math.abs(light.shadow.camera.left).toFixed(1)}</span>
      </div>
      <input
        type="range"
        min="5"
        max="30"
        step="1"
        value={Math.abs(light.shadow.camera.left)}
        onChange={(e) => {
          const value = parseFloat(e.target.value);
          light.shadow.camera.left = -value;
          light.shadow.camera.right = value;
          light.shadow.camera.top = value;
          light.shadow.camera.bottom = -value;
          light.shadow.camera.updateProjectionMatrix();
          useEditorStore.getState().updateTransform();
        }}
        className="w-full h-1.5 mt-1"
      />
    </div>
  );
}