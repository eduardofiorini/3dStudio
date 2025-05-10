import { useEditorStore } from '../../store/editorStore';
import { cn } from '../../utils/cn';
import * as THREE from 'three';
import { Image, X, ChevronDown } from 'lucide-react';

import { MATERIAL_PRESETS, MaterialType } from '../../utils/materials/types';
import { convertModelMaterials } from '../../utils/materials/conversion';

interface MaterialControlsProps {
  material: THREE.Material;
  object: THREE.Object3D;
}

export function MaterialControls({ material, object }: MaterialControlsProps) {
  // Early return if no material
  if (!material) return null;

  const currentType = material instanceof THREE.MeshPhysicalMaterial ? 'physical' : 
                     (!material.colorWrite && material.depthWrite) ? 'hider' : 
                     material instanceof THREE.ShadowMaterial ? 'shadow' :
                     'standard';
  const isHider = currentType === 'hider';
  const isShadow = currentType === 'shadow';
  const isGLBModel = object.userData.isGLBModel;

  // Skip material controls if using a shader material
  if (material instanceof THREE.ShaderMaterial) {
    return (
      <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
        <p>This object is using a custom shader material. Edit the shader in the Shader Assets panel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Material Type Selector */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Material Type</label>
        <div className="relative">
          <select
            className={cn(
              "w-full appearance-none",
              "bg-[#252526] hover:bg-[#2a2a2b]",
              "border border-gray-700/50 hover:border-gray-600/50",
              "rounded-md",
              "px-3 py-2 pr-8",
              "text-xs text-gray-200",
              "cursor-pointer",
              "transition-colors duration-150",
              "outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
            )}
            value={currentType as MaterialType}
            onChange={(e) => {
              const type = e.target.value as MaterialType;
              const preset = MATERIAL_PRESETS[type];
              if (!preset) return;
              
              if (isGLBModel) {
                // For GLB models, convert all mesh materials
                convertModelMaterials(object, type);
              } else {
                // Determine the correct color based on type
                const color = type === 'physical' ? '#ffffff' : '#636363';

                const newMaterial = preset.create({
                  color: color
                });

                // Copy over any existing maps/textures
                if (material.map) {
                  newMaterial.map = material.map;
                }

                object.material = newMaterial;
              }
              
              useEditorStore.getState().updateTransform();
            }}
          >
            {Object.entries(MATERIAL_PRESETS).map(([type, preset]) => (
              <option key={type} value={type}>{preset.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Material Properties */}
      {!isHider && (
        <>
          {/* Only show color controls for standard/physical materials */}
          {!isShadow && material.color && (
            <>
              {/* Color */}
              <div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 flex-1">Color</label>
                  <input
                    type="color"
                    value={`#${material.color.getHexString()}`}
                    onChange={(e) => {
                      material.color.set(e.target.value);
                      material.needsUpdate = true;
                      useEditorStore.getState().updateTransform();
                    }}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={`#${material.color.getHexString()}`}
                    onChange={(e) => {
                      material.color.set(e.target.value);
                      useEditorStore.getState().updateTransform();
                    }}
                    className="w-20 py-0.5 px-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200"
                  />
                </div>
              </div>
            </>
          )}

          {/* Material Properties */}
          {!isShadow && (
            <div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400 flex-1">Texture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (!event.target?.result) return;
                      
                      new THREE.TextureLoader().load(
                        event.target.result as string,
                        (texture) => {
                          texture.needsUpdate = true;
                          material.map = texture;
                          material.needsUpdate = true;
                          useEditorStore.getState().updateTransform();
                        }
                      );
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                  id="texture-upload"
                />
                <label
                  htmlFor="texture-upload"
                  className="flex items-center gap-2 px-2 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded text-xs text-gray-300 cursor-pointer"
                >
                  <Image className="w-3.5 h-3.5" />
                  <span>{material.map ? 'Change' : 'Add'}</span>
                </label>
                {material.map && (
                  <button
                    onClick={() => {
                      material.map = null;
                      material.needsUpdate = true;
                      useEditorStore.getState().updateTransform();
                    }}
                    className="p-1.5 hover:bg-gray-700/50 rounded text-gray-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {material instanceof THREE.MeshPhysicalMaterial && (
            <>
              <MaterialSlider
                label="Transmission"
                value={material.transmission}
                onChange={(value) => {
                  material.transmission = value;
                  material.transparent = value > 0;
                  material.needsUpdate = true;
                  useEditorStore.getState().updateTransform();
                }}
              />

              <MaterialSlider
                label="Thickness"
                value={material.thickness}
                max={5}
                onChange={(value) => {
                  material.thickness = value;
                  material.needsUpdate = true;
                  useEditorStore.getState().updateTransform();
                }}
              />

              <MaterialSlider
                label="IOR"
                value={material.ior}
                min={1}
                max={2.333}
                step={0.001}
                onChange={(value) => {
                  material.ior = value;
                  material.needsUpdate = true;
                  useEditorStore.getState().updateTransform();
                }}
              />
            </>
          )}

          <MaterialSlider
            label="Opacity"
            value={material.opacity}
            onChange={(value) => {
              material.opacity = value;
              material.transparent = value < 1;
              material.needsUpdate = true;
              useEditorStore.getState().updateTransform();
            }}
          />

          {!isShadow && (
            <>
              <MaterialSlider
                label="Roughness"
                value={material.roughness}
                onChange={(value) => {
                  material.roughness = value;
                  useEditorStore.getState().updateTransform();
                }}
              />

              <MaterialSlider
                label="Metalness"
                value={material.metalness}
                onChange={(value) => {
                  material.metalness = value;
                  useEditorStore.getState().updateTransform();
                }}
              />

              <MaterialSlider
                label="Emissive Intensity"
                value={material.emissiveIntensity}
                max={5}
                onChange={(value) => {
                  material.emissiveIntensity = value;
                  material.needsUpdate = true;
                  useEditorStore.getState().updateTransform();
                }}
              />

              {/* Emissive Color */}
              <div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 flex-1">Emissive Color</label>
                  <input
                    type="color"
                    value={`#${material.emissive?.getHexString() || '000000'}`}
                    onChange={(e) => {
                      material.emissive.set(e.target.value);
                      material.needsUpdate = true;
                      useEditorStore.getState().updateTransform();
                    }}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={`#${material.emissive?.getHexString() || '000000'}`}
                    onChange={(e) => {
                      material.emissive.set(e.target.value);
                      material.needsUpdate = true;
                      useEditorStore.getState().updateTransform();
                    }}
                    className="w-20 py-0.5 px-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200"
                  />
                </div>
              </div>
            </>
          )}

          {/* Shadow Controls */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={material.side === THREE.DoubleSide}
              onChange={(e) => {
                material.side = e.target.checked ? THREE.DoubleSide : THREE.FrontSide;
                material.needsUpdate = true;
                useEditorStore.getState().updateTransform();
              }}
              className="rounded border-gray-700"
            />
            <span className="text-xs text-gray-400">Double-Sided</span>
          </label>

          <div className="space-y-2 pt-2 border-t border-gray-700/50">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={object.castShadow}
                onChange={(e) => {
                  object.castShadow = e.target.checked;
                  useEditorStore.getState().updateTransform();
                }}
                className="rounded border-gray-700"
              />
              <span className="text-xs text-gray-400">Cast Shadows</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={object.receiveShadow}
                onChange={(e) => {
                  object.receiveShadow = e.target.checked;
                  useEditorStore.getState().updateTransform();
                }}
                className="rounded border-gray-700"
              />
              <span className="text-xs text-gray-400">Receive Shadows</span>
            </label>
          </div>
        </>
      )}
      
      {/* Info Banner for Hider Material */}
      {isHider ? (
        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
          <p>This object uses a Hider material that occludes other objects.</p>
        </div>
      ) : isShadow && (
        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
          <p>This object uses a Shadow material that only shows shadows cast on it.</p>
        </div>
      )}
    </div>
  );
}

interface MaterialSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function MaterialSlider({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 1, 
  step = 0.1 
}: MaterialSliderProps) {
  return (
    <div className="slider-container">
      <label className="slider-label" title={label}>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-input"
      />
      <span className="slider-value">{value.toFixed(2)}</span>
    </div>
  );
}