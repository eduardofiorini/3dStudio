import { useEditorStore } from '../../store/editorStore';
import * as THREE from 'three';
import { Camera } from 'lucide-react';
import { cn } from '../../utils/cn';

export function CameraSettings() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const updateTransform = useEditorStore((state) => state.updateTransform);

  if (!selectedObject?.userData.isCamera || !(selectedObject instanceof THREE.PerspectiveCamera)) {
    return null;
  }

  const camera = selectedObject as THREE.PerspectiveCamera;

  const updateCamera = (updates: Partial<{ fov: number; near: number; far: number }>) => {
    Object.assign(camera, updates);
    camera.updateProjectionMatrix();
    camera.userData.updateHelper?.();
    
    updateTransform();
  };

  return (
    <div className="space-y-4">
      {/* Preview Button */}
      <div className="relative group">
        <button
        onClick={() => {
          // Set camera preview visibility in store
          useEditorStore.getState().setCameraPreviewVisible(true);
        }}
          className={cn(
            "flex items-center justify-center gap-2 w-full",
            "px-3 py-2.5 rounded-md transition-all duration-200",
            "bg-blue-500/10 hover:bg-blue-500/20",
            "border border-blue-500/20 hover:border-blue-500/30",
            "text-blue-300 hover:text-blue-200",
            "group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          )}
        >
          <Camera className="w-4 h-4" />
          <span className="text-sm">Preview Camera</span>
        </button>
      </div>

      {/* FOV Slider */}
      <div className="slider-container">
        <label className="slider-label">FOV</label>
        <input
          type="range"
          min="1"
          max="180"
          step="1"
          value={camera.fov}
          onChange={(e) => updateCamera({ fov: parseFloat(e.target.value) })}
          className="slider-input"
        />
        <span className="slider-value">{camera.fov.toFixed(1)}°</span>
      </div>

      {/* Near Plane */}
      <div className="slider-container">
        <label className="slider-label">Near Plane</label>
        <input
          type="range"
          min="0.2"
          max="10"
          step="0.1"
          value={camera.near}
          onChange={(e) => updateCamera({ near: parseFloat(e.target.value) })}
          className="slider-input"
        />
        <span className="slider-value">{camera.near.toFixed(1)}</span>
      </div>

      {/* Far Plane */}
      <div className="slider-container">
        <label className="slider-label">Far Plane</label>
        <input
          type="range"
          min="50"
          max="2000"
          step="100"
          value={camera.far}
          onChange={(e) => updateCamera({ far: parseFloat(e.target.value) })}
          className="slider-input"
        />
        <span className="slider-value">{camera.far.toFixed(0)}</span>
      </div>

      {/* Helper Toggle */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!camera.userData.helper?.visible}
          onChange={(e) => {
            camera.userData.toggleHelper(e.target.checked);
            updateTransform();
          }}
          className="rounded border-gray-700 checked:bg-blue-500 checked:border-blue-600"
        />
        <span className="text-xs text-gray-400">Show Helper</span>
      </label>
    </div>
  );
}