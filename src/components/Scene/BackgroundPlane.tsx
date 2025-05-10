import { useEditorStore } from '../../store/editorStore';
import * as THREE from 'three';

interface BackgroundPlaneProps {
  onClick?: (e: THREE.Event) => void;
}

export function BackgroundPlane({ onClick }: BackgroundPlaneProps) {
  return (
    <mesh
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={onClick}
      renderOrder={-1}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial 
        visible={false}
        transparent={true}
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}