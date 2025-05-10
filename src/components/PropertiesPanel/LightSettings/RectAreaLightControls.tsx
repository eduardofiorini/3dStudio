import { RectAreaLight } from 'three';
import { useEditorStore } from '../../../store/editorStore';
import { useState, useEffect } from 'react';

interface RectAreaLightControlsProps {
  light: RectAreaLight;
}

export function RectAreaLightControls({ light }: RectAreaLightControlsProps) {
  const [width, setWidth] = useState(light.width);
  const [height, setHeight] = useState(light.height);
  const [key, setKey] = useState(0); // Add key for forcing re-render

  // Sync state with light properties
  useEffect(() => {
    setWidth(light.width);
    setHeight(light.height);
    setKey(prev => prev + 1);
  }, [light]);

  const updateHelper = () => {
    light.traverse((child) => {
      if (child.type === 'RectAreaLightHelper') {
        child.update();
      }
    });
  };

  const handleWidthChange = (value: number) => {
    light.width = value;
    setWidth(value);
    updateHelper();
    useEditorStore.getState().updateTransform();
  };

  const handleHeightChange = (value: number) => {
    light.height = value;
    setHeight(value);
    updateHelper();
    useEditorStore.getState().updateTransform();
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Width</label>
          <span className="text-xs text-gray-400" key={`width-${key}`}>{width.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="20"
          step="0.1"
          value={width}
          onChange={(e) => {
            handleWidthChange(parseFloat(e.target.value));
          }}
          className="w-full h-1.5 mt-1"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Height</label>
          <span className="text-xs text-gray-400" key={`height-${key}`}>{height.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="20"
          step="0.1"
          value={height}
          onChange={(e) => {
            handleHeightChange(parseFloat(e.target.value));
          }}
          className="w-full h-1.5 mt-1"
        />
      </div>
    </>
  );
}