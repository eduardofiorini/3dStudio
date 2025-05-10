import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useEditorStore } from '../../store/editorStore';

interface CameraPreviewProps {
  camera: THREE.PerspectiveCamera;
}

export function CameraPreview({ camera }: CameraPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Get the main scene and renderer
    const mainScene = (window as any).__THREE_SCENE__;
    if (!mainScene) {
      console.warn('Main scene not found');
      return;
    }

    // Create preview renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    // Match main renderer settings
    renderer.setSize(256, 256);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      if (renderer && camera) {
        // Keep square aspect for preview
        camera.aspect = 1; // Square aspect for preview
        camera.updateProjectionMatrix();
        
        // Render main scene with preview camera
        renderer.render(mainScene, camera);
      }
    }
    animate();

    return () => {
      renderer.dispose();
    };
  }, [camera]);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[#252526] rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ aspectRatio: '1/1' }}
        />
      </div>
      <div className="pt-[100%]" /> {/* Maintain 1:1 aspect ratio */}
    </div>
  );
}