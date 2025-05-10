import { useEditorStore } from '../../store/editorStore';
import { cn } from '../../utils/cn';

export function PostProcessingSettings() {
  const sceneSettings = useEditorStore((state) => state.sceneSettings);
  const updateSceneSettings = useEditorStore((state) => state.updateSceneSettings);

  const handlePostProcessingChange = (key: string, value: boolean | number) => {
    updateSceneSettings({
      postProcessing: {
        ...sceneSettings.postProcessing,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-2">
      {/* Brightness & Contrast */}
      <div className="slider-container">
        <label className="slider-label">Brightness</label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={sceneSettings.postProcessing?.brightness ?? 0}
          onChange={(e) => handlePostProcessingChange('brightness', parseFloat(e.target.value))}
          className="slider-input"
        />
        <span className="slider-value">
          {(sceneSettings.postProcessing?.brightness ?? 0).toFixed(1)}
        </span>
      </div>
      <div className="slider-container">
        <label className="slider-label">Contrast</label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={sceneSettings.postProcessing?.contrast ?? 0}
          onChange={(e) => handlePostProcessingChange('contrast', parseFloat(e.target.value))}
          className="slider-input"
        />
        <span className="slider-value">
          {(sceneSettings.postProcessing?.contrast ?? 0).toFixed(1)}
        </span>
      </div>

      {/* Pixelation */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sceneSettings.postProcessing?.pixelation ?? false}
            onChange={(e) => handlePostProcessingChange('pixelation', e.target.checked)}
            className={cn(
              "rounded border-gray-700",
              "focus:ring-2 focus:ring-blue-500/50",
              "checked:bg-blue-500 checked:border-blue-600"
            )}
          />
          <span className="text-xs text-gray-400">Pixelation</span>
        </label>
        {sceneSettings.postProcessing?.pixelation && (
          <div className="slider-container mt-2">
            <label className="slider-label">Pixel Size</label>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={sceneSettings.postProcessing?.pixelSize ?? 5}
              onChange={(e) => handlePostProcessingChange('pixelSize', parseInt(e.target.value))}
              className="slider-input"
            />
            <span className="slider-value">
              {sceneSettings.postProcessing?.pixelSize ?? 5}
            </span>
          </div>
        )}
      </div>

      {/* Bloom */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sceneSettings.postProcessing?.bloom ?? false}
            onChange={(e) => handlePostProcessingChange('bloom', e.target.checked)}
            className={cn(
              "rounded border-gray-700",
              "focus:ring-2 focus:ring-blue-500/50",
              "checked:bg-blue-500 checked:border-blue-600"
            )}
          />
          <span className="text-xs text-gray-400">Bloom Effect</span>
        </label>
        {sceneSettings.postProcessing?.bloom && (
          <div className="slider-container mt-2">
            <label className="slider-label">Intensity</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={sceneSettings.postProcessing?.bloomIntensity ?? 0.5}
              onChange={(e) => handlePostProcessingChange('bloomIntensity', parseFloat(e.target.value))}
              className="slider-input"
            />
            <span className="slider-value">
              {(sceneSettings.postProcessing?.bloomIntensity ?? 0.5).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Depth of Field */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sceneSettings.postProcessing?.depthOfField ?? false}
            onChange={(e) => handlePostProcessingChange('depthOfField', e.target.checked)}
            className={cn(
              "rounded border-gray-700",
              "focus:ring-2 focus:ring-blue-500/50",
              "checked:bg-blue-500 checked:border-blue-600"
            )}
          />
          <span className="text-xs text-gray-400">Depth of Field</span>
        </label>
      </div>

      {/* Noise */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sceneSettings.postProcessing?.noise ?? false}
            onChange={(e) => handlePostProcessingChange('noise', e.target.checked)}
            className={cn(
              "rounded border-gray-700",
              "focus:ring-2 focus:ring-blue-500/50",
              "checked:bg-blue-500 checked:border-blue-600"
            )}
          />
          <span className="text-xs text-gray-400">Film Grain</span>
        </label>
      </div>

      {/* Vignette */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sceneSettings.postProcessing?.vignette ?? false}
            onChange={(e) => handlePostProcessingChange('vignette', e.target.checked)}
            className={cn(
              "rounded border-gray-700",
              "focus:ring-2 focus:ring-blue-500/50",
              "checked:bg-blue-500 checked:border-blue-600"
            )}
          />
          <span className="text-xs text-gray-400">Vignette</span>
        </label>
        {sceneSettings.postProcessing?.vignette && (
          <div className="slider-container mt-2">
            <label className="slider-label">Amount</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={sceneSettings.postProcessing?.vignetteAmount ?? 0.5}
              onChange={(e) => handlePostProcessingChange('vignetteAmount', parseFloat(e.target.value))}
              className="slider-input"
            />
            <span className="slider-value">
              {(sceneSettings.postProcessing?.vignetteAmount ?? 0.5).toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}