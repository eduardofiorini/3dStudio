import { useEditorStore } from '../../store/editorStore';
import {
  FountainConfig,
  initializeParticles,
  // If createParticleFountain is needed:
  // createParticleFountain
} from '../../utils/objects/particles';
import * as THREE from 'three';

export function ParticleSettings() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const updateTransform = useEditorStore((state) => state.updateTransform);

  if (!selectedObject?.userData.fountainConfig || !selectedObject.geometry) return null;

  const config = selectedObject.userData.fountainConfig as FountainConfig;

  // Generic merge + reinit logic
  const updateConfig = (updates: Partial<FountainConfig>) => {
    const oldCount = config.count;
    const oldStyle = config.style;
    const newConfig = { ...config, ...updates };

    // If user updated the min/max in lifetimeRange, ensure it overrides config.lifetime
    if (newConfig.lifetimeRange) {
      // Optional validation
      if (newConfig.lifetimeRange.minLifetime < 1) {
        newConfig.lifetimeRange.minLifetime = 1;
      }
      // etc...
    }

    selectedObject.userData.fountainConfig = newConfig;

    // If count changed, re-init geometry
    if (newConfig.count !== oldCount) {
      if (selectedObject.geometry) {
        selectedObject.geometry.dispose();
      }
      selectedObject.geometry = new THREE.BufferGeometry();
      initializeParticles(selectedObject, newConfig);
    }

    // Update material if style, blending or depthWrite changed
    const material = selectedObject.material as THREE.PointsMaterial;

    // If style changed, create new material
    if (oldStyle !== newConfig.style) {
      if (material) material.dispose();
      
      if (newConfig.style === 'textured') {
        // Create smoke texture using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        
        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        selectedObject.material = new THREE.PointsMaterial({
          size: newConfig.size,
          map: texture,
          vertexColors: true,
          blending: blendModeToThree(newConfig.blendingMode),
          transparent: true,
          opacity: newConfig.opacity,
          depthWrite: !!newConfig.useDepthWrite
        });
      } else {
        selectedObject.material = new THREE.PointsMaterial({
          size: newConfig.size * 0.3, // Smaller size for points
          vertexColors: true,
          blending: blendModeToThree(newConfig.blendingMode),
          transparent: true,
          opacity: newConfig.opacity,
          depthWrite: !!newConfig.useDepthWrite
        });
      }
    } else {
      // Just update existing material properties
      material.size = newConfig.style === 'textured' ? newConfig.size : newConfig.size * 0.3;
      material.opacity = newConfig.opacity;
      material.depthWrite = !!newConfig.useDepthWrite;
      material.blending = blendModeToThree(newConfig.blendingMode);
      material.needsUpdate = true;
    }

    updateTransform();
  };

  // Helper to convert blending mode
  function blendModeToThree(mode?: FountainConfig['blendingMode']) {
    switch (mode) {
      case 'Normal':
        return THREE.NormalBlending;
      case 'Multiply':
        return THREE.MultiplyBlending;
      case 'Subtractive':
        return THREE.SubtractiveBlending;
      default:
        return THREE.AdditiveBlending;
    }
  }

  return (
    <div className="space-y-4 text-white">
      {/* COLOR */}
      <div className={config.colorRange?.enabled ? "opacity-50 pointer-events-none" : ""}>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 flex-1">Base Color</label>
          <input
            type="color"
            value={`#${new THREE.Color().setHSL(config.color.hue, config.color.saturation, config.color.lightness).getHexString()}`}
            onChange={(e) => {
              const color = new THREE.Color(e.target.value);
              const hsl = { h: 0, s: 0, l: 0 };
              color.getHSL(hsl);
              updateConfig({
                color: {
                  hue: hsl.h,
                  saturation: hsl.s,
                  lightness: hsl.l
                }
              });
            }}
            className="w-6 h-6 rounded cursor-pointer"
          />
          <input
            type="text"
            value={`#${new THREE.Color().setHSL(config.color.hue, config.color.saturation, config.color.lightness).getHexString()}`}
            onChange={(e) => {
              const color = new THREE.Color(e.target.value);
              const hsl = { h: 0, s: 0, l: 0 };
              color.getHSL(hsl);
              updateConfig({
                color: {
                  hue: hsl.h,
                  saturation: hsl.s,
                  lightness: hsl.l
                }
              });
            }}
            className="w-20 py-0.5 px-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200"
          />
        </div>
      </div>

      {/* COLOR RANGE */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs text-gray-400">Color Range</label>
          <input
            type="checkbox"
            checked={config.colorRange?.enabled ?? false}
            onChange={(e) => {
              const currentColor = new THREE.Color().setHSL(
                config.color.hue,
                config.color.saturation,
                config.color.lightness
              );
              const hsl = { h: 0, s: 0, l: 0 };
              currentColor.getHSL(hsl);

              updateConfig({
                colorRange: {
                  enabled: e.target.checked,
                  start: {
                    hue: hsl.h,
                    saturation: hsl.s,
                    lightness: hsl.l
                  },
                  end: {
                    hue: hsl.h,
                    saturation: hsl.s,
                    lightness: hsl.l * 0.5  // Make end color darker by default
                  }
                }
              })
            }}
            className="rounded border-gray-700 checked:bg-blue-500 checked:border-blue-600"
          />
        </div>

        {config.colorRange?.enabled && (
          <div className="space-y-3 mt-2">
            {/* Start Color */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400 flex-1">Start Color</label>
                <input
                  type="color"
                  value={`#${new THREE.Color().setHSL(
                    config.colorRange.start.hue,
                    config.colorRange.start.saturation,
                    config.colorRange.start.lightness
                  ).getHexString()}`}
                  onChange={(e) => {
                    const color = new THREE.Color(e.target.value);
                    const hsl = { h: 0, s: 0, l: 0 };
                    color.getHSL(hsl);
                    updateConfig({
                      colorRange: {
                        ...config.colorRange,
                        start: {
                          hue: hsl.h,
                          saturation: hsl.s,
                          lightness: hsl.l
                        }
                      }
                    });
                  }}
                  className="w-6 h-6 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={`#${new THREE.Color().setHSL(
                    config.colorRange.start.hue,
                    config.colorRange.start.saturation,
                    config.colorRange.start.lightness
                  ).getHexString()}`}
                  onChange={(e) => {
                    const color = new THREE.Color(e.target.value);
                    const hsl = { h: 0, s: 0, l: 0 };
                    color.getHSL(hsl);
                    updateConfig({
                      colorRange: {
                        ...config.colorRange,
                        start: {
                          hue: hsl.h,
                          saturation: hsl.s,
                          lightness: hsl.l
                        }
                      }
                    });
                  }}
                  className="w-20 py-0.5 px-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200"
                />
              </div>
            </div>
            
            {/* End Color */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400 flex-1">End Color</label>
                <input
                  type="color"
                  value={`#${new THREE.Color().setHSL(
                    config.colorRange.end.hue,
                    config.colorRange.end.saturation,
                    config.colorRange.end.lightness
                  ).getHexString()}`}
                  onChange={(e) => {
                    const color = new THREE.Color(e.target.value);
                    const hsl = { h: 0, s: 0, l: 0 };
                    color.getHSL(hsl);
                    updateConfig({
                      colorRange: {
                        ...config.colorRange,
                        end: {
                          hue: hsl.h,
                          saturation: hsl.s,
                          lightness: hsl.l
                        }
                      }
                    });
                  }}
                  className="w-6 h-6 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={`#${new THREE.Color().setHSL(
                    config.colorRange.end.hue,
                    config.colorRange.end.saturation,
                    config.colorRange.end.lightness
                  ).getHexString()}`}
                  onChange={(e) => {
                    const color = new THREE.Color(e.target.value);
                    const hsl = { h: 0, s: 0, l: 0 };
                    color.getHSL(hsl);
                    updateConfig({
                      colorRange: {
                        ...config.colorRange,
                        end: {
                          hue: hsl.h,
                          saturation: hsl.s,
                          lightness: hsl.l
                        }
                      }
                    });
                  }}
                  className="w-20 py-0.5 px-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PARTICLE COUNT */}
      <div className={selectedObject?.userData.objectType === 'Particles' && selectedObject?.userData.fountainConfig?.speedFactor === 0.02 ? "opacity-50 pointer-events-none" : ""}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs">Particle Count</label>
            {selectedObject?.userData.fountainConfig?.speedFactor === 0.02 && (
              <span className="text-[10px] text-gray-500">(Disabled for dust)</span>
            )}
          </div>
          <span className="text-xs">{config.count}</span>
        </div>
        <input
          type="range"
          min={100}
          max={20000}
          step={100}
          value={config.count}
          onChange={(e) => updateConfig({ count: parseInt(e.target.value) })}
          className="w-full h-1.5 mt-1"
        />
      </div>

      {/* SIZE */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs">Size</label>
          <span className="text-xs">{config.size.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.01}
          max={1}
          step={0.01}
          value={config.size}
          onChange={(e) => updateConfig({ size: parseFloat(e.target.value) })}
          className="w-full h-1.5 mt-1"
        />
      </div>

      {/* OPACITY */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs">Opacity</label>
          <span className="text-xs">{config.opacity.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={config.opacity}
          onChange={(e) => updateConfig({ opacity: parseFloat(e.target.value) })}
          className="w-full h-1.5 mt-1"
        />
      </div>

      {/* GRAVITY */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs">Gravity</label>
          <span className="text-xs">{config.gravity.toFixed(3)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={0.05}
          step={0.001}
          value={config.gravity}
          onChange={(e) => updateConfig({ gravity: parseFloat(e.target.value) })}
          className="w-full h-1.5 mt-1"
        />
      </div>

      {/* INITIAL BOOST */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs">Initial Boost</label>
          <span className="text-xs">{config.initialBoost.toFixed(3)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={0.5}
          step={0.01}
          value={config.initialBoost}
          onChange={(e) => updateConfig({ initialBoost: parseFloat(e.target.value) })}
          className="w-full h-1.5 mt-1"
        />
      </div>

      {/* LIFETIME RANGE */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Lifetime Range</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 block mb-1">Min</label>
            <input
              type="number"
              value={config.lifetimeRange?.minLifetime ?? config.lifetime.min}
              onChange={(e) =>
                updateConfig({
                  lifetimeRange: {
                    ...config.lifetimeRange,
                    minLifetime: parseFloat(e.target.value),
                    maxLifetime: config.lifetimeRange?.maxLifetime ?? config.lifetime.max,
                  },
                })
              }
              className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 block mb-1">Max</label>
            <input
              type="number"
              value={config.lifetimeRange?.maxLifetime ?? config.lifetime.max}
              onChange={(e) =>
                updateConfig({
                  lifetimeRange: {
                    ...config.lifetimeRange,
                    maxLifetime: parseFloat(e.target.value),
                    minLifetime: config.lifetimeRange?.minLifetime ?? config.lifetime.min,
                  },
                })
              }
              className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
            />
          </div>
        </div>
      </div>
      {/* SPEED FACTOR */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs">Speed Factor</label>
          <span className="text-xs">{(config.speedFactor ?? 1).toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.01"
          max="2"
          step="0.01"
          value={config.speedFactor ?? 1}
          onChange={(e) => updateConfig({ speedFactor: parseFloat(e.target.value) })}
          className="w-full h-1.5 mt-1"
        />
      </div>

      {/* TURBULENCE */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs">Turbulence</label>
          <span className="text-xs">{(config.turbulence ?? 0).toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={0.2}
          step={0.01}
          value={config.turbulence ?? 0}
          onChange={(e) => updateConfig({ turbulence: parseFloat(e.target.value) })}
          className="w-full h-1.5 mt-1"
        />
      </div>
      {/* PARTICLE STYLE */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Particle Style</label>
        <select
          className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
          value={config.style || 'point'}
          onChange={(e) => updateConfig({ style: e.target.value as 'point' | 'textured' })}
        >
          <option value="point">Point</option>
          <option value="textured">Textured</option>
        </select>
      </div>

      {/* BLENDING MODE */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Blending Mode</label>
        <select
          className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
          value={config.blendingMode}
          onChange={(e) => updateConfig({ blendingMode: e.target.value as FountainConfig['blendingMode'] })}
        >
          <option value="Additive">Additive</option>
          <option value="Normal">Normal</option>
          <option value="Multiply">Multiply</option>
          <option value="Subtractive">Subtractive</option>
        </select>
      </div>

      {/* DEPTH WRITE */}
      <div className="flex items-center gap-2 mt-2">
        <label className="text-xs text-gray-400">Depth Write</label>
        <input
          type="checkbox"
          checked={config.useDepthWrite ?? false}
          onChange={(e) => updateConfig({ useDepthWrite: e.target.checked })}
          className="rounded border-gray-700 checked:bg-blue-500 checked:border-blue-600"
        />
      </div>
    </div>
  );
}
