import { Grid, useThree } from '@react-three/drei';
import { float32BufferAttribute } from 'three/src/core/BufferAttribute';
import * as THREE from 'three';
import { useEditorStore } from '../../store/editorStore';

function AxisLines() {
  return (
    <group position={[0, 0.002, 0]} userData={{ isGrid: true }}>
      {/* X Axis - Red */}
      <line position={[0, 0, 0]}>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-10, 0, 0, 10, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="red"
          linewidth={.7}             // Note: may not be supported on all platforms
          transparent={true}
          opacity={0.3}            // Lower opacity for subtle effect
          depthWrite={false}
          depthTest={true}
          polygonOffset={true}
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </line>

      {/* Z Axis - Blue */}
      <line position={[0, 0, 0]}>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, -10, 0, 0, 10]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="blue"
          linewidth={.7}
          transparent={true}
          opacity={0.3}
          depthWrite={false}
          depthTest={true}
          polygonOffset={true}
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </line>
    </group>
  );
}

export function SceneGrid() {
  const sceneSettings = useEditorStore((state) => state.sceneSettings);
  const showEnvBackground = sceneSettings.envMap?.enabled && sceneSettings.envMap.showBackground;

  return (
    <>
      <Grid
        position={[0, -0.005, 0]}
        args={[100, 100]}
        side={THREE.DoubleSide}
        cellColor={showEnvBackground ? "#666666" : "#333333"}
        sectionColor={showEnvBackground ? "#777777" : "#3c3c3c"}
        cellThickness={0.7}
        sectionThickness={1.1}
        fadeDistance={50}
        fadeStrength={3}
        userData={{ isGrid: true }}
        raycast={() => null}
      />
      <AxisLines />
    </>
  );
}