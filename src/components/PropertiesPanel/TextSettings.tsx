import React from 'react';
import * as THREE from 'three';
import { useEditorStore } from '../../store/editorStore';
import { createText, TextOptions, AVAILABLE_FONTS } from '../../utils/objects/text';
import { useDragInput } from '../../hooks/useDragInput';
import { cn } from '../../utils/cn';

const FONT_NAMES = {
  helvetiker: 'Helvetiker',
  gentilis: 'Gentilis',
  droid: 'Droid Serif',
  droid_sans: 'Droid Sans'
};
export default function TextSettings() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const panelSections = useEditorStore((state) => state.panelSections);
  
  if (!selectedObject?.userData.textOptions) return null;
  
  const textOptions = selectedObject.userData.textOptions as TextOptions;
  
  const { handleMouseDown: handleSizeMouseDown, handleClick: handleSizeClick, isDragging: isSizeDragging } = useDragInput({
    onChange: (value) => updateText({ size: value }),
    step: 0.1,
    min: 0.1,
    sensitivity: 0.005
  });

  const { handleMouseDown: handleDepthMouseDown, handleClick: handleDepthClick, isDragging: isDepthDragging } = useDragInput({
    onChange: (value) => updateText({ height: value }),
    step: 0.1,
    min: 0.1,
    sensitivity: 0.005
  });

  const updateText = async (newOptions: Partial<TextOptions>) => {
    // Store panel section states
    const currentPanelState = panelSections[selectedObject.uuid];
    
    // Store current material state
    const currentMaterial = selectedObject instanceof THREE.Mesh ? selectedObject.material : null;
    let materialConfig = null;
    
    if (currentMaterial instanceof THREE.MeshStandardMaterial) {
      materialConfig = {
        type: currentMaterial instanceof THREE.MeshPhysicalMaterial ? 'physical' : 
              (!currentMaterial.colorWrite && currentMaterial.depthWrite) ? 'hider' : 'standard',
        color: '#' + currentMaterial.color.getHexString(),
        emissive: '#' + currentMaterial.emissive.getHexString(),
        emissiveIntensity: currentMaterial.emissiveIntensity,
        metalness: currentMaterial.metalness,
        roughness: currentMaterial.roughness,
        opacity: currentMaterial.opacity,
        transparent: currentMaterial.transparent,
        transmission: currentMaterial instanceof THREE.MeshPhysicalMaterial ? currentMaterial.transmission : undefined,
        thickness: currentMaterial instanceof THREE.MeshPhysicalMaterial ? currentMaterial.thickness : undefined,
        ior: currentMaterial instanceof THREE.MeshPhysicalMaterial ? currentMaterial.ior : undefined
      };
    }
    
    const updatedOptions = {
      ...textOptions,
      ...newOptions,
      material: materialConfig
    };
    
    // Store current transform
    const position = selectedObject.position.clone();
    const rotation = selectedObject.rotation.clone();
    const scale = selectedObject.scale.clone();
    
    // Create new text object
    const newTextObject = await createText(updatedOptions);
    
    // Restore transform
    newTextObject.position.copy(position);
    newTextObject.rotation.copy(rotation);
    newTextObject.scale.copy(scale);
    
    // Replace old object
    const objects = useEditorStore.getState().objects;
    const index = objects.indexOf(selectedObject);
    if (index !== -1) {
      objects[index] = newTextObject;
      
      // Preserve panel section states for the new object
      if (currentPanelState) {
        useEditorStore.getState().setPanelSectionState(newTextObject.uuid, 'transform', currentPanelState.transform);
        useEditorStore.getState().setPanelSectionState(newTextObject.uuid, 'material', currentPanelState.material);
        useEditorStore.getState().setPanelSectionState(newTextObject.uuid, 'physics', currentPanelState.physics);
        useEditorStore.getState().setPanelSectionState(newTextObject.uuid, 'text', true);
      }
      
      useEditorStore.getState().setSelectedObject(newTextObject);
      useEditorStore.getState().updateTransform();
    }
  };

  return (
    <div className="space-y-4">
      {/* Text Input */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Font</label>
        <select
          value={textOptions.font || AVAILABLE_FONTS.helvetiker}
          onChange={(e) => updateText({ font: e.target.value })}
          className="w-full py-0.5 px-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200"
        >
          {Object.entries(AVAILABLE_FONTS).map(([key, value]) => (
            <option key={key} value={value}>
              {FONT_NAMES[key as keyof typeof FONT_NAMES]}
            </option>
          ))}
        </select>
      </div>
      
      {/* Size Control */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Text</label>
        <input
          type="text"
          value={textOptions.text}
          onChange={(e) => updateText({ text: e.target.value })}
          className="w-full py-0.5 px-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200"
        />
      </div>
      
      {/* Font Selection */}
      <div className="slider-container">
        <label className="slider-label">Size</label>
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={Number(textOptions.size).toFixed(1)}
          onChange={(e) => updateText({ size: parseFloat(e.target.value) })}
          className="slider-input"
        />
        <span className="slider-value">{Number(textOptions.size).toFixed(1)}</span>
      </div>
      
      {/* 3D Text Settings */}
      {textOptions.is3D && (
        <div className="space-y-4">
          {/* Depth Control */}
          <div className="slider-container">
            <label className="slider-label">Depth</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={Number(textOptions.height).toFixed(1)}
              onChange={(e) => updateText({ height: parseFloat(e.target.value) })}
              className="slider-input"
            />
            <span className="slider-value">{Number(textOptions.height).toFixed(1)}</span>
          </div>

          {/* Bevel Settings */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={textOptions.bevel?.enabled ?? false}
                onChange={(e) => updateText({
                  bevel: {
                    ...textOptions.bevel,
                    enabled: e.target.checked
                  }
                })}
                className="rounded border-gray-700 checked:bg-blue-500 checked:border-blue-600"
              />
              <span className="text-xs text-gray-400">Enable Bevel</span>
            </label>

            {textOptions.bevel?.enabled && (
              <div className="space-y-3 pl-6">
                {/* Bevel Thickness */}
                <div className="slider-container">
                  <label className="slider-label">Thickness</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.1"
                    step="0.01"
                    value={textOptions.bevel?.thickness ?? 0.02}
                    onChange={(e) => updateText({
                      bevel: {
                        ...textOptions.bevel,
                        thickness: parseFloat(e.target.value)
                      }
                    })}
                    className="slider-input"
                  />
                  <span className="slider-value">
                    {(textOptions.bevel?.thickness ?? 0.02).toFixed(2)}
                  </span>
                </div>

                {/* Bevel Size */}
                <div className="slider-container">
                  <label className="slider-label">Size</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.1"
                    step="0.01"
                    value={textOptions.bevel?.size ?? 0.02}
                    onChange={(e) => updateText({
                      bevel: {
                        ...textOptions.bevel,
                        size: parseFloat(e.target.value)
                      }
                    })}
                    className="slider-input"
                  />
                  <span className="slider-value">
                    {(textOptions.bevel?.size ?? 0.02).toFixed(2)}
                  </span>
                </div>

                {/* Bevel Segments */}
                <div className="slider-container">
                  <label className="slider-label">Segments</label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={textOptions.bevel?.segments ?? 3}
                    onChange={(e) => updateText({
                      bevel: {
                        ...textOptions.bevel,
                        segments: parseInt(e.target.value)
                      }
                    })}
                    className="slider-input"
                  />
                  <span className="slider-value">
                    {textOptions.bevel?.segments ?? 3}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}