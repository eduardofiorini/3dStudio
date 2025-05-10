import { useEditorStore } from '../../store/editorStore';
import { PointLight, DirectionalLight, AmbientLight, RectAreaLight, SpotLight } from 'three';
import { cn } from '../../utils/cn';

export function LightSettings() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  
  if (!selectedObject?.userData.isLight) return null;
  
  const light = selectedObject;
  const isPointLight = light instanceof PointLight;
  const isDirectionalLight = light instanceof DirectionalLight;
  const isAmbientLight = light instanceof AmbientLight;
  const isRectAreaLight = light instanceof RectAreaLight;
  const isSpotLight = light instanceof SpotLight;

  return (
    <div className="space-y-4">
      {/* Width and Height Controls for RectAreaLight */}
      {isRectAreaLight && (
        <>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Width</label>
              <span className="text-xs text-gray-400">{(light as RectAreaLight).width.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={(light as RectAreaLight).width}
              onChange={(e) => {
                const width = parseFloat(e.target.value);
                (light as RectAreaLight).width = width;
                // Force helper update by recreating it
                const helper = light.children.find(child => child.name === 'RectAreaLightHelper');
                if (helper) {
                  helper.geometry.dispose();
                  helper.material.dispose();
                  light.remove(helper);
                  const RectAreaLightHelper = light.userData.RectAreaLightHelper;
                  if (RectAreaLightHelper) {
                    const newHelper = new RectAreaLightHelper(light as RectAreaLight);
                    newHelper.name = 'RectAreaLightHelper';
                    light.add(newHelper);
                  }
                }
                useEditorStore.getState().updateTransform();
              }}
              className="w-full h-1.5 mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Height</label>
              <span className="text-xs text-gray-400">{(light as RectAreaLight).height.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={(light as RectAreaLight).height}
              onChange={(e) => {
                const height = parseFloat(e.target.value);
                (light as RectAreaLight).height = height;
                // Force helper update by recreating it
                const helper = light.children.find(child => child.name === 'RectAreaLightHelper');
                if (helper) {
                  helper.geometry.dispose();
                  helper.material.dispose();
                  light.remove(helper);
                  const RectAreaLightHelper = light.userData.RectAreaLightHelper;
                  if (RectAreaLightHelper) {
                    const newHelper = new RectAreaLightHelper(light as RectAreaLight);
                    newHelper.name = 'RectAreaLightHelper';
                    light.add(newHelper);
                  }
                }
                useEditorStore.getState().updateTransform();
              }}
              className="w-full h-1.5 mt-1"
            />
          </div>
        </>
      )}

      {/* Color */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={`#${light.color.getHexString()}`}
            onChange={(e) => {
              light.color.set(e.target.value);
              // Update sphere color if it exists
              const sphere = light.children[0];
              if (sphere?.material) {
                sphere.material.color.set(e.target.value);
              }
              useEditorStore.getState().updateTransform();
            }}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={`#${light.color.getHexString()}`}
            onChange={(e) => {
              light.color.set(e.target.value);
              useEditorStore.getState().updateTransform();
            }}
            className="flex-1 py-0.5 px-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200"
          />
        </div>
      </div>

      {/* Intensity */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Intensity</label>
          <span className="text-xs text-gray-400">{light.intensity.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={isPointLight || isSpotLight ? "100" : "10"}
          step="0.1"
          value={light.intensity}
          onChange={(e) => {
            light.intensity = parseFloat(e.target.value);
            useEditorStore.getState().updateTransform();
          }}
          className="w-full h-1.5 mt-1"
        />
      </div>

      {/* Point Light Specific Controls */}
      {isPointLight && (
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
                if (light.userData.updateHelper) {
                  light.userData.updateHelper();
                }
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
      )}

      {/* Spotlight Specific Controls */}
      {isSpotLight && (
        <>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Distance</label>
              <span className="text-xs text-gray-400">{light.distance.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={light.distance}
              onChange={(e) => {
                light.distance = parseFloat(e.target.value);
                if (light.userData.updateHelper) {
                  light.userData.updateHelper();
                }
                useEditorStore.getState().updateTransform();
              }}
              className="w-full h-1.5 mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Angle</label>
              <span className="text-xs text-gray-400">{(light.angle * 180 / Math.PI).toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={light.angle * 180 / Math.PI}
              onChange={(e) => {
                light.angle = parseFloat(e.target.value) * Math.PI / 180;
                if (light.userData.updateHelper) {
                  light.userData.updateHelper();
                }
                useEditorStore.getState().updateTransform();
              }}
              className="w-full h-1.5 mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Penumbra</label>
              <span className="text-xs text-gray-400">{light.penumbra.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={light.penumbra}
              onChange={(e) => {
                light.penumbra = parseFloat(e.target.value);
                if (light.userData.updateHelper) {
                  light.userData.updateHelper();
                }
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
                if (light.userData.updateHelper) {
                  light.userData.updateHelper();
                }
                useEditorStore.getState().updateTransform();
              }}
              className="w-full h-1.5 mt-1"
            />
          </div>
        </>
      )}

      {/* Shadow Settings for Point and Directional Lights */}
      {(isPointLight || isDirectionalLight || isSpotLight) && (
        <div className="space-y-2">
          {/* Helper Toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={light.children.find(child => child.name === 'SpotLightHelper')?.visible ?? true}
              onChange={(e) => {
                const helper = light.children.find(child => child.name === 'SpotLightHelper');
                if (helper) {
                  helper.visible = e.target.checked;
                  useEditorStore.getState().updateTransform();
                }
              }}
              className={cn(
                "rounded border-gray-700",
                "focus:ring-2 focus:ring-blue-500/50",
                "checked:bg-blue-500 checked:border-blue-600"
              )}
            />
            <span className="text-xs text-gray-400">Show Helper</span>
          </label>

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

              {isDirectionalLight && (
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
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}