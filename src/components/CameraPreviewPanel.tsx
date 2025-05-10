import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useEditorStore } from '../store/editorStore';
import { cn } from '../utils/cn';
import { Minimize2, Maximize2, X } from 'lucide-react';

export function CameraPreviewPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isVisible = useEditorStore((state) => state.cameraPreviewVisible);
  const setIsVisible = useEditorStore((state) => state.setCameraPreviewVisible);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const [containerSize, setContainerSize] = useState({ width: 400, height: 225 });
  const activeCameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Update active camera when a camera is selected
  useEffect(() => {
    if (selectedObject instanceof THREE.PerspectiveCamera) {
      activeCameraRef.current = selectedObject;
    }
  }, [selectedObject]);

  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;

    // Get the main scene
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
    const pixelRatio = Math.min(2, window.devicePixelRatio);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(containerSize.width, containerSize.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Animation loop
    let frameId: number;
    function animate() {
      frameId = requestAnimationFrame(animate);
      const camera = activeCameraRef.current;
      if (renderer && camera && mainScene && canvasRef.current) {
        // Keep 16:9 aspect for preview
        camera.aspect = 16/9;
        camera.updateProjectionMatrix();
        
        // Update renderer size if container size changed
        const width = canvasRef.current.clientWidth * pixelRatio;
        const height = canvasRef.current.clientHeight * pixelRatio;
        if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
          renderer.setSize(width, height, false);
        }

        // Render main scene with preview camera
        renderer.render(mainScene, camera);
      }
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, [isVisible, containerSize]);

  // Update canvas size when expanded state changes
  useEffect(() => {
    const width = isExpanded ? window.innerWidth / 2 : 400;
    const height = width * (9/16); // Maintain 16:9 aspect ratio
    
    setContainerSize({ width, height });
  }, [isExpanded]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed right-4 bottom-20 z-50 bg-[#252526] rounded-lg shadow-xl border border-gray-700/50",
        "transition-all duration-300 ease-in-out transform",
        isExpanded ? "w-1/2" : "w-[400px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/50">
        <h3 className="text-sm font-medium text-gray-300">Camera View</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-700/50 rounded text-gray-400"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-700/50 rounded text-gray-400"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ 
            width: containerSize.width,
            height: containerSize.height
          }}
        />
      </div>
    </div>
  );
}