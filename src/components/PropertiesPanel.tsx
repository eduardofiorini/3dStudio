import * as THREE from 'three';
import React, { useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import { updateObjectTransform } from '../utils/transforms';
import { getRotationDegrees } from '../utils/transforms/rotation';
import { LightSettings } from './PropertiesPanel/LightSettings';
import SceneSettings from './PropertiesPanel/SceneSettings';
import TextSettings from './PropertiesPanel/TextSettings';
import { MaterialControls } from './PropertiesPanel/MaterialControls';
import PhysicsSettings from './PropertiesPanel/PhysicsSettings';
import { ParticleSettings } from './PropertiesPanel/ParticleSettings';
import { CameraSettings } from './PropertiesPanel/CameraSettings';
import { ShapesSettings } from './PropertiesPanel/ShapesSettings';
import { TransformGroup } from './PropertiesPanel/TransformGroup';
import { SplatSettings } from './PropertiesPanel/SplatSettings';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toFixed(3) : '0';
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  objectId: string;
  sectionKey: 'transform' | 'material' | 'physics' | 'light';
  icon?: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, objectId, sectionKey, icon = null, defaultOpen = false }: SectionProps) {
  const isOpen = useEditorStore((state) => state.getPanelSectionState(objectId, sectionKey));
  const setPanelSectionState = useEditorStore((state) => state.setPanelSectionState);
  
  // Auto-expand light section for lights
  useEffect(() => {
    if (defaultOpen || (sectionKey === 'light' && objectId && !isOpen)) {
      setPanelSectionState(objectId, sectionKey, true);
    }
  }, [objectId, sectionKey, defaultOpen, isOpen, setPanelSectionState]);

  return (
    <div className="border-b border-gray-700 last:border-b-0 pb-4">
      <button
        onClick={() => setPanelSectionState(objectId, sectionKey, !isOpen)}
        className="flex items-center gap-1.5 w-full py-1.5 px-1 hover:bg-gray-700/30 rounded"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span className="text-sm font-medium text-gray-200">{title}</span>
      </button>
      {isOpen && <div className="mt-1.5 space-y-3">{children}</div>}
    </div>
  );
}

export default function PropertiesPanel() {
  const transformUpdate = useEditorStore((state) => state.transformUpdate);
  const undoCount = useEditorStore((state) => state.undoStack.length);
  const redoCount = useEditorStore((state) => state.redoStack.length);
  const transformMode = useEditorStore((state) => state.transformMode);
  const selectedObject = useEditorStore(
    (state) => state.selectedObject,
  );

  // Force re-render when transform state changes
  useEffect(() => {}, [transformUpdate, undoCount, redoCount]);

  const updateTransform = (
    type: 'position' | 'rotation' | 'scale',
    axis: 'x' | 'y' | 'z',
    value: number,
  ) => {
    if (selectedObject) {
      updateObjectTransform(selectedObject, type, axis, value);
      useEditorStore.getState().updateTransform();
    }
  };

  if (!selectedObject) {
    return (
      <div className="w-[270px] bg-[#252526] border-l border-[#1e1e1e] z-20 flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700/50">
          <h2 className="text-sm font-medium text-gray-300">Properties</h2>
        </div>
        <div className="p-3 overflow-y-auto">
          <SceneSettings />
        </div>
      </div>
    );
  }

  // Check if object has material before accessing material properties
  let material;
  if (selectedObject instanceof THREE.Mesh) {
    material = selectedObject.material;
  } else if (selectedObject.children?.length > 0) {
    // Find first child with material
    const meshChild = selectedObject.children.find(
      child => child instanceof THREE.Mesh
    ) as THREE.Mesh;
    if (meshChild) {
      material = meshChild.material;
    }
  }

  // Check if material exists and determine its type
  const hasStandardMaterial = material && material instanceof THREE.MeshStandardMaterial;
  const hasShaderMaterial = material && material instanceof THREE.ShaderMaterial;
  const hasShadowMaterial = material && material instanceof THREE.ShadowMaterial;

  const rotationDegrees = {
    x: getRotationDegrees(selectedObject, 'x'),
    y: getRotationDegrees(selectedObject, 'y'),
    z: getRotationDegrees(selectedObject, 'z'),
  };

  return (
    <div className="w-[270px] bg-[#252526] border-l border-[#1e1e1e] text-gray-200 z-20 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700/50">
        <h2 className="text-sm font-medium text-gray-300">Properties</h2>
      </div>
      <div className="p-3 overflow-y-auto overflow-x-hidden thin-scrollbar">
        <div className="space-y-1">
          <Section title="Transform" objectId={selectedObject.uuid} sectionKey="transform" icon={null}>
            <div>
              <TransformGroup
                title="Location"
                values={{
                  x: selectedObject.position.x,
                  y: selectedObject.position.y,
                  z: selectedObject.position.z
                }}
                onChange={(axis, value) => updateTransform('position', axis, value)}
                step={0.1}
                isHighlighted={transformMode === 'translate'}
              />
              {/* Only show rotation and scale for non-lights or rect area lights */}
              {(!selectedObject.userData.isLight || selectedObject instanceof THREE.RectAreaLight) && (
                <>
                  <TransformGroup
                    title="Rotation"
                    values={rotationDegrees}
                    onChange={(axis, value) => updateTransform('rotation', axis, value)}
                    step={15}
                    isHighlighted={transformMode === 'rotate'}
                  />

                  <TransformGroup
                    title="Scale"
                    values={selectedObject.scale}
                    onChange={(axis, value) => updateTransform('scale', axis, value)}
                    step={0.1}
                    min={0.1}
                    isHighlighted={transformMode === 'scale'}
                  />
                </>
              )}
            </div>
          </Section>

          {selectedObject.userData.isLight && (
            <Section 
              title="Light" 
              objectId={selectedObject.uuid} 
              sectionKey="light"
              defaultOpen={true}
            >
              <LightSettings />
            </Section>
          )}

          {selectedObject.userData.isCamera && (
            <Section title="Camera" objectId={selectedObject.uuid} sectionKey="camera" defaultOpen={true}>
              <CameraSettings />
            </Section>
          )}

          {selectedObject.userData.textOptions && (
            <Section title="Text" objectId={selectedObject.uuid} sectionKey="text" defaultOpen={true}>
              <TextSettings />
            </Section>
          )}
          
          {/* Add Splat section for gaussian splat objects */}
          {selectedObject.userData.isGaussianSplat && (
            <Section title="Splat" objectId={selectedObject.uuid} sectionKey="splat" defaultOpen={true}>
              <SplatSettings />
            </Section>
          )}
          
          {/* Add Shapes section for primitive shapes */}
          {selectedObject instanceof THREE.Mesh && ['BoxGeometry', 'SphereGeometry', 'CylinderGeometry', 'ConeGeometry', 'TorusGeometry', 'PlaneGeometry', 'CapsuleGeometry'].includes(selectedObject.geometry.type) && (
            <Section title="Shape" objectId={selectedObject.uuid} sectionKey="shape">
              <ShapesSettings />
            </Section>
          )}
          
          {selectedObject.userData.objectType === 'Particles' && (
            <Section title="Particles" objectId={selectedObject.uuid} sectionKey="particles" defaultOpen={true}>
              <ParticleSettings />
            </Section>
          )}

          {material && !hasShaderMaterial && hasStandardMaterial && (
            <Section title="Material" objectId={selectedObject.uuid} sectionKey="material">
              <MaterialControls material={material} object={selectedObject} />
            </Section>
          )}
          {material && hasShadowMaterial && (
            <Section title="Material" objectId={selectedObject.uuid} sectionKey="material">
              <MaterialControls material={material} object={selectedObject} />
            </Section>
          )}
          
          {hasShaderMaterial && (
            <Section title="Shader" objectId={selectedObject.uuid} sectionKey="shader">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
                <p>This object uses a custom shader material. Edit the shader in the Shader Assets panel.</p>
              </div>
            </Section>
          )}

          {/* Only show physics section for non-particle objects */}
          {!selectedObject.userData.objectType?.includes('Particles') && (
            <Section title="Physics" objectId={selectedObject.uuid} sectionKey="physics">
              <PhysicsSettings />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}