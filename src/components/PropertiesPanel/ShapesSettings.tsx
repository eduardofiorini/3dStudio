import { useEditorStore } from '../../store/editorStore';
import { cn } from '../../utils/cn';
import * as THREE from 'three';
import { useState, useEffect } from 'react';
import React from 'react';

export function ShapesSettings() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const updateTransform = useEditorStore((state) => state.updateTransform);
  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
    depth: 1,
    radius: 0.5,
    tube: 0.2,
    segments: 32,
    widthSegments: 32,
    heightSegments: 16,
    radiusTop: 0.5,
    radiusBottom: 0.5
  });

  // Initialize dimensions from current geometry
  useEffect(() => {
    if (selectedObject instanceof THREE.Mesh) {
      const geometry = selectedObject.geometry;
      const params = geometry.parameters;
      
      setDimensions(prev => ({
        ...prev,
        width: params.width ?? prev.width,
        height: params.height ?? prev.height,
        depth: params.depth ?? prev.depth,
        radius: params.radius ?? prev.radius,
        tube: params.tube ?? prev.tube,
        segments: params.radialSegments ?? prev.segments,
        widthSegments: params.widthSegments ?? prev.widthSegments,
        heightSegments: params.heightSegments ?? prev.heightSegments,
        radiusTop: params.radiusTop ?? prev.radiusTop,
        radiusBottom: params.radiusBottom ?? prev.radiusBottom
      }));
    }
  }, [selectedObject]);

  if (!selectedObject || !(selectedObject instanceof THREE.Mesh)) return null;

  // Get geometry type
  const geometryType = selectedObject.geometry.type;
  const isShape = ['BoxGeometry', 'SphereGeometry', 'CylinderGeometry', 'ConeGeometry', 'TorusGeometry', 'PlaneGeometry', 'CapsuleGeometry'].includes(geometryType);

  if (!isShape) return null;

  const updateGeometry = (params: Record<string, number>) => {
    // Update local state first
    setDimensions(prev => ({ ...prev, ...params }));
    
    let newGeometry: THREE.BufferGeometry;

    switch (geometryType) {
      case 'BoxGeometry':
        newGeometry = new THREE.BoxGeometry(
          params.width ?? dimensions.width,
          params.height ?? dimensions.height,
          params.depth ?? dimensions.depth
        );
        break;
      case 'SphereGeometry':
        newGeometry = new THREE.SphereGeometry(
          params.radius ?? dimensions.radius,
          params.widthSegments ?? dimensions.widthSegments,
          params.heightSegments ?? dimensions.heightSegments
        );
        break;
      case 'CylinderGeometry':
        newGeometry = new THREE.CylinderGeometry(
          params.radiusTop ?? dimensions.radiusTop,
          params.radiusBottom ?? dimensions.radiusBottom,
          params.height ?? dimensions.height,
          params.segments ?? dimensions.segments
        );
        break;
      case 'ConeGeometry':
        newGeometry = new THREE.ConeGeometry(
          params.radius ?? dimensions.radius,
          params.height ?? dimensions.height,
          params.segments ?? dimensions.segments
        );
        break;
      case 'TorusGeometry':
        newGeometry = new THREE.TorusGeometry(
          params.radius ?? dimensions.radius,
          params.tube ?? dimensions.tube,
          params.segments ?? dimensions.segments,
          params.tubularSegments ?? dimensions.segments * 2
        );
        break;
      case 'CapsuleGeometry':
        newGeometry = new THREE.CapsuleGeometry(
          params.radius ?? dimensions.radius,
          params.height ?? dimensions.height,
          params.segments ?? dimensions.segments,
          params.segments ?? dimensions.segments
        );
        break;
      case 'PlaneGeometry':
        newGeometry = new THREE.PlaneGeometry(
          params.width ?? dimensions.width,
          params.height ?? dimensions.height
        );
        break;
      default:
        return;
    }

    // Dispose old geometry and update
    selectedObject.geometry.dispose();
    selectedObject.geometry = newGeometry;
    updateTransform();
  };

  const renderGeometryControls = () => {
    switch (geometryType) {
      case 'BoxGeometry':
        return (
          <div className="space-y-3">
            <GeometrySlider
              label="Width"
              value={dimensions.width}
              onChange={(value) => updateGeometry({ width: value })}
            />
            <GeometrySlider
              label="Height"
              value={dimensions.height}
              onChange={(value) => updateGeometry({ height: value })}
            />
            <GeometrySlider
              label="Depth"
              value={dimensions.depth}
              onChange={(value) => updateGeometry({ depth: value })}
            />
          </div>
        );
      case 'SphereGeometry':
        return (
          <div className="space-y-3">
            <GeometrySlider
              label="Radius"
              value={dimensions.radius}
              onChange={(value) => updateGeometry({ radius: value })}
            />
            <GeometrySlider
              label="Segments"
              value={dimensions.segments}
              min={3}
              max={64}
              step={1}
              onChange={(value) => updateGeometry({ 
                widthSegments: value,
                heightSegments: Math.floor(value/2),
                segments: value
              })}
            />
          </div>
        );
      case 'CylinderGeometry':
        return (
          <div className="space-y-3">
            <GeometrySlider
              label="Top Radius"
              value={dimensions.radiusTop}
              onChange={(value) => updateGeometry({ radiusTop: value })}
            />
            <GeometrySlider
              label="Bottom Radius"
              value={dimensions.radiusBottom}
              onChange={(value) => updateGeometry({ radiusBottom: value })}
            />
            <GeometrySlider
              label="Height"
              value={dimensions.height}
              onChange={(value) => updateGeometry({ height: value })}
            />
            <GeometrySlider
              label="Segments"
              value={dimensions.segments}
              min={3}
              max={64}
              step={1}
              onChange={(value) => updateGeometry({ segments: value })}
            />
          </div>
        );
      case 'ConeGeometry':
        return (
          <div className="space-y-3">
            <GeometrySlider
              label="Radius"
              value={dimensions.radius}
              onChange={(value) => updateGeometry({ radius: value })}
            />
            <GeometrySlider
              label="Height"
              value={dimensions.height}
              onChange={(value) => updateGeometry({ height: value })}
            />
            <GeometrySlider
              label="Segments"
              value={dimensions.segments}
              min={3}
              max={64}
              step={1}
              onChange={(value) => updateGeometry({ segments: value })}
            />
          </div>
        );
      case 'TorusGeometry':
        return (
          <div className="space-y-3">
            <GeometrySlider
              label="Radius"
              value={dimensions.radius}
              onChange={(value) => updateGeometry({ radius: value })}
            />
            <GeometrySlider
              label="Tube"
              value={dimensions.tube}
              max={1}
              step={0.01}
              onChange={(value) => updateGeometry({ tube: value })}
            />
            <GeometrySlider
              label="Segments"
              value={dimensions.segments}
              min={3}
              max={64}
              step={1}
              onChange={(value) => updateGeometry({ 
                segments: value,
                tubularSegments: Math.floor(value * 2)
              })}
            />
          </div>
        );
      case 'CapsuleGeometry':
        return (
          <div className="space-y-3">
            <GeometrySlider
              label="Radius"
              value={dimensions.radius}
              onChange={(value) => updateGeometry({ radius: value })}
            />
            <GeometrySlider
              label="Height"
              value={dimensions.height}
              onChange={(value) => updateGeometry({ height: value })}
            />
            <GeometrySlider
              label="Segments"
              value={dimensions.segments}
              min={3}
              max={64}
              step={1}
              onChange={(value) => updateGeometry({ segments: value })}
            />
          </div>
        );
      case 'PlaneGeometry':
        return (
          <div className="space-y-3">
            <GeometrySlider
              label="Width"
              value={dimensions.width}
              onChange={(value) => updateGeometry({ width: value })}
            />
            <GeometrySlider
              label="Height"
              value={dimensions.height}
              onChange={(value) => updateGeometry({ height: value })}
            />
            <GeometrySlider
              label="Segments"
              value={dimensions.segments}
              min={3}
              max={64}
              step={1}
              onChange={(value) => updateGeometry({ segments: value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderGeometryControls()}
    </div>
  );
}

interface GeometrySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const GeometrySlider = React.memo(({ 
  label, 
  value, 
  onChange, 
  min = 0.1, 
  max = 10, 
  step = 0.1 
}: GeometrySliderProps) => {
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
});

GeometrySlider.displayName = 'GeometrySlider';