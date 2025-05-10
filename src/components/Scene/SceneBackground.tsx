import { useEditorStore } from '../../store/editorStore';
import * as THREE from 'three';

interface SceneBackgroundProps {
  onClick?: (e: THREE.Event) => void;
}

export function SceneBackground({ onClick }: SceneBackgroundProps) {
  const isSelecting = useEditorStore((state) => state.isSelecting);
  const isTransforming = useEditorStore((state) => state.isTransforming);

  const handleClick = (e: THREE.Event) => {
    // Don't deselect during selection or transform operations
    if (isSelecting || isTransforming) return;
    onClick?.(e);
  };

  return (
    <mesh
      position={[0, -100, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={handleClick}
      renderOrder={-1000}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial 
        visible={false}
        transparent={true}
        opacity={0}
        depthTest={false}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}