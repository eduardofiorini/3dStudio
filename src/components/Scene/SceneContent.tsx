import { useEffect } from 'react';
import * as THREE from 'three';
import { useRapier } from '@react-three/rapier';
import { useEditorStore } from '../../store/editorStore';
import { Grid } from '@react-three/drei';
import { useTimelineStore } from '../../store/timelineStore';
import { Environment } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { PhysicsObject } from './PhysicsObject';
import { GLBPhysicsObject } from './GLBPhysicsObject';
import { PhysicsManager } from './PhysicsManager';
import { createDirectionalLight, createAmbientLight } from '../../utils/objects';
import { SceneBackground } from './SceneBackground';
import { SceneGrid } from './SceneGrid';
import { DragEvent } from 'react';

export function SceneContent() {
  const objects = useEditorStore((state) => state.objects);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const draggedMaterial = useEditorStore((state) => state.draggedMaterial);
  const sceneSettings = useEditorStore((state) => state.sceneSettings);
  const isTransforming = useEditorStore((state) => state.isTransforming);
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const currentTime = useTimelineStore((state) => state.currentTime);
  const { world } = useRapier();
  const addObject = useEditorStore((state) => state.addObject);
  
  // Animate particles and shaders
  useFrame((state) => {
    objects.forEach(object => {
      if (!object) return;
      
      // Handle particle animations
      if (object.userData?.objectType === 'Particles' && object.userData.animate) {
        object.userData.animate();
      }
      
      // Handle shader animations
      if (object instanceof THREE.Mesh && object.material instanceof THREE.ShaderMaterial) {
        // Update common uniforms
        if (!object.material.uniforms) {
          object.material.uniforms = {};
        }
        
        // Add time uniform if it doesn't exist
        if (!object.material.uniforms.time) {
          object.material.uniforms.time = { value: 0 };
        }
        object.material.uniforms.time.value = state.clock.elapsedTime;
        
        // Add resolution uniform if it doesn't exist
        if (!object.material.uniforms.resolution) {
          object.material.uniforms.resolution = { value: new THREE.Vector2() };
        }
        object.material.uniforms.resolution.value.set(
          state.size.width,
          state.size.height
        );
      }
    });
  });

  // Create scene lights on mount
  useEffect(() => {
    // Check if lights already exist
    const hasDirectionalLight = objects.some(obj => 
      obj && obj.userData?.isLight && obj.userData.objectType === 'Directional Light'
    );
    const hasAmbientLight = objects.some(obj => 
      obj && obj.userData?.isLight && obj.userData.objectType === 'Ambient Light'
    );

    // Only create lights if they don't exist
    if (!hasDirectionalLight) {
    // Create directional light
    const directionalLight = createDirectionalLight({
      position: {
        x: sceneSettings.directionalLightPosition.x,
        y: sceneSettings.directionalLightPosition.y,
        z: sceneSettings.directionalLightPosition.z
      },
      intensity: sceneSettings.directionalLightIntensity,
      color: sceneSettings.directionalLightColor
    });
      addObject(directionalLight);
    }
    
    if (!hasAmbientLight) {
    // Create ambient light
    const ambientLight = createAmbientLight({
      intensity: sceneSettings.ambientLightIntensity,
      color: sceneSettings.ambientLightColor
    });
    addObject(ambientLight);
    }
  }, []);

  // Reset physics world when time is 0
  useEffect(() => {
    if (currentTime === 0) {
      // Clear all physics bodies
      const bodies = Array.from(world.bodies);
      bodies.forEach(body => {
        world.removeRigidBody(body);
      });
    }
  }, [currentTime, world]);

  // Make objects globally available for animation system
  useEffect(() => {
    window.__THREE_OBJECTS = objects;
  }, [objects]);

  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    if (!isTransforming) {
      setSelectedObject(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (draggedMaterial) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, object: THREE.Object3D) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedMaterial && object instanceof THREE.Mesh) {
      object.material = draggedMaterial.material.clone();
      useEditorStore.getState().updateTransform();
    }
  };

  return (
    <>
      <PhysicsManager />
      {/* Environment map */}
      {sceneSettings.envMap?.enabled ? (
        <Environment
          preset={sceneSettings.envMap.preset}
          files={sceneSettings.envMap.url}
          background={sceneSettings.envMap.showBackground}
          blur={0.06}
          resolution={2048}
          encoding={THREE.LinearEncoding}
          intensity={sceneSettings.envMap.intensity}
        />
      ) : null}
      {/* Only show background color if env map is disabled or background is hidden */}
      {!sceneSettings.envMap?.enabled || !sceneSettings.envMap.showBackground ? (
        <color attach="background" args={[sceneSettings.backgroundColor]} />
      ) : null}
      <SceneBackground onClick={handleClick} />
      {sceneSettings.showGrid && (
        <SceneGrid />
      )}
      {objects.map((object, index) => {
        if (!object) return null; // Skip null objects

        const physicsType = object.userData?.physicsType;
        const isPhysicsEnabled = object.userData?.physicsEnabled;
        const isGLBModel = object.userData?.isGLBModel;

        if (!isPhysicsEnabled) {
          return (
            <primitive
              key={index}
              object={object}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, object)}
              onClick={(e) => {
                e.stopPropagation();
                if (!isTransforming) {
                  setSelectedObject(object);
                }
              }}
            />
          );
        }

        // Use specialized GLB physics handling for GLB models
        if (isGLBModel) {
          return (
            <GLBPhysicsObject
              key={index}
              object={object}
              type={physicsType || 'dynamic'}
              onClick={(e) => {
                e.stopPropagation();
                if (!isTransforming) {
                  setSelectedObject(object);
                }
              }}
            />
          );
        }

        return (
          <PhysicsObject
            key={index}
            object={object}
            type={physicsType || 'dynamic'}
            onClick={(e) => {
              e.stopPropagation();
              if (!isTransforming) {
                setSelectedObject(object);
              }
            }}
          />
        );
      })}
    </>
  );
}