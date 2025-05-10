import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

interface ShaderPreviewProps {
  size?: number;
  vertexShader?: string;
  fragmentShader?: string;
}

export function ShaderPreview({ size = 48, vertexShader, fragmentShader }: ShaderPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.Camera>();

  // Create shader material
  const material = useMemo(() => {
    if (!vertexShader || !fragmentShader) return null;
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(size, size) }
      }
    });
  }, [vertexShader, fragmentShader, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = size;
    canvas.height = size;

    // Setup Three.js
    rendererRef.current = new THREE.WebGLRenderer({ canvas, alpha: true });
    rendererRef.current.setSize(size, size);

    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    cameraRef.current.position.z = 1;

    // Create preview quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material || new THREE.MeshBasicMaterial());
    sceneRef.current.add(mesh);

    const animate = () => {
      if (material) {
        material.uniforms.time.value = performance.now() / 1000;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Cleanup
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [size, material]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded"
    />
  );
}