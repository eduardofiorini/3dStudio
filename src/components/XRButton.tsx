import { useEffect, useState } from 'react';
import { Glasses } from 'lucide-react';
import { cn } from '../utils/cn';
import * as THREE from 'three';

export function XRButton() {
  const [isInXR, setIsInXR] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check AR support on mount
  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr
        .isSessionSupported('immersive-ar')
        .then((supported) => {
          setIsARSupported(supported);
        })
        .catch((err) => console.warn('AR support check failed:', err));
    }
  }, []);

  const startARSession = async () => {
    // Retrieve global Three.js renderer, scene, and camera
    const renderer = (window as any).__THREE_RENDERER__;
    const scene = (window as any).__THREE_SCENE__;
    const camera = (window as any).__THREE_CAMERA__;

    if (!renderer) return;

    setIsLoading(true);

    try {
      // Session configuration with optional and required features
      const sessionInit = {
        optionalFeatures: [
          'local-floor',
          'hit-test',
          'dom-overlay',
          'anchors',
          'plane-detection',
          'light-estimation'
        ],
        requiredFeatures: ['local-floor']
      };

      // Request AR session
      const session = await navigator.xr.requestSession('immersive-ar', sessionInit);

      // Use a floor-aligned reference space for AR (and not "local")
      renderer.xr.setReferenceSpaceType('local-floor');

      // Prepare renderer for AR transparency
      renderer.setClearAlpha(0);
      renderer.setClearColor(0x000000, 0);
      renderer.sortObjects = true;

      // --- Add controllers ---
      // Controller #0
      const controller1 = renderer.xr.getController(0);
      controller1.addEventListener('selectstart', (event) => { /* your logic */ });
      controller1.addEventListener('selectend', (event) => { /* your logic */ });
      scene.add(controller1);

      // Controller #1 (if needed)
      const controller2 = renderer.xr.getController(1);
      controller2.addEventListener('selectstart', (event) => { /* your logic */ });
      controller2.addEventListener('selectend', (event) => { /* your logic */ });
      scene.add(controller2);
      // --- End adding controllers ---

      // Handle session end
      session.addEventListener('end', () => {
        setIsInXR(false);
        setIsLoading(false);
        // Clean-up or restore renderer state
        try {
          renderer.setClearAlpha(1);
          renderer.setClearColor(0x000000, 1);
        } catch (error) {
          console.warn('Error during AR cleanup:', error);
        }
      });

      // Set the session on the renderer
      await renderer.xr.setSession(session);

      // Start AR animation loop
      renderer.setAnimationLoop(() => {
        if (scene && camera) {
          try {
            renderer.render(scene, camera);
          } catch (error) {
            console.warn('Render error in AR loop:', error);
          }
        }
      });

      setIsInXR(true);
    } catch (error) {
      console.warn('Error starting AR session:', error);
      // Attempt graceful cleanup
      try {
        if (isInXR) {
          await endARSession();
        }
      } catch (cleanupError) {
        console.warn('Error during error cleanup:', cleanupError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const endARSession = async () => {
    const renderer = (window as any).__THREE_RENDERER__;
    if (!renderer?.xr.getSession()) return;

    try {
      renderer.setAnimationLoop(null);
      await renderer.xr.getSession().end();
    } catch (error) {
      console.warn('Error ending AR session:', error);
    }
  };

  // Clean-up on component unmount
  useEffect(() => {
    return () => {
      if (isInXR) {
        endARSession();
      }
    };
  }, [isInXR]);

  if (!isARSupported) return null;

  return (
    <button
      onClick={() => (isInXR ? endARSession() : startARSession())}
      disabled={isLoading}
      className={cn(
        "fixed bottom-20 left-3 z-50 mb-2",
        "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
        "text-sm font-medium",
        isLoading && "opacity-50 cursor-not-allowed",
        isInXR
          ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
          : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
        "border border-blue-500/20"
      )}
    >
      <Glasses className="w-4 h-4" />
      <span>
        {isLoading ? 'Loading...' : isInXR ? 'Exit AR' : 'Enter AR'}
      </span>
    </button>
  );
}
