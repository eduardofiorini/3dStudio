import { Grid } from '@react-three/drei';
import { float32BufferAttribute } from 'three/src/core/BufferAttribute';

interface GridAndAxesProps {
  show: boolean;
}

function AxisLines() {
  return (
    <group position={[0, 0.002, 0]}>
      {/* X Axis - Red */}
      <line position={[0, 0, 0]}>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-10, 0, 0, 10, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="red" linewidth={2} />
      </line>
      
      {/* Z Axis - Blue */}
      <line position={[0, 0, 0]}>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, -10, 0, 0, 10]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="blue" linewidth={2} />
      </line>
    </group>
  );
}

export function GridAndAxes({ show }: GridAndAxesProps) {
  if (!show) return null;

  return (
    <>
      <Grid
        position={[0, -0.005, 0]}
        args={[20, 20]}
        cellColor="#999999"
        sectionColor="#666666"
        fadeDistance={30}
        fadeStrength={1}
      />
      <AxisLines />
    </>
  );
}