import { useThree } from '@react-three/fiber';
import { useEditorStore } from '../../store/editorStore';
import { useEffect } from 'react';
import { Environment } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { SceneObjects } from './SceneObjects';
import { SceneLighting } from './SceneLighting';
import { initializeRenderer } from './initialization/initializeRenderer';

export default function Scene() {
  const objects = useEditorStore((state) => state.objects);
  const sceneSettings = useEditorStore((state) => state.sceneSettings);
  const physics = useEditorStore((state) => state.physics);
  const { gl, scene } = useThree();

  // Initialize renderer once
  useEffect(() => {
    initializeRenderer(gl, sceneSettings);
  }, [gl]);
  
  // Make objects globally available for animation system
  useEffect(() => {
    window.__THREE_OBJECTS = objects;
  }, [objects]);

  return (
    <Physics
      paused={!physics.running || physics.paused}
      gravity={[0, -9.81, 0]}
      timeStep={1/60}
      interpolate={true}
    >
      <Environment preset="studio" background={false} intensity={0.3} />
      <SceneLighting />
      <SceneObjects />
    </Physics>
  );
}