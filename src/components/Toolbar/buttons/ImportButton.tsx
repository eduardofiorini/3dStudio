import { Upload, FileCode, Image, Film, Box } from 'lucide-react';
import { useRef } from 'react';
import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { loadGLBModel } from '../../../utils/objects/modelLoader';
import { ToolbarMenu } from '../ToolbarMenu';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { createMediaPlane } from '../../../utils/objects';

export function ImportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const addObject = useEditorStore((state) => state.addObject);
  const glbInputRef = useRef<HTMLInputElement>(null);
  const plyInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const CustomLoadingUI = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#252526] rounded-lg p-6 space-y-4 shadow-xl border border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-200">Loading PLY Scene...</p>
        </div>
        <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-progress" />
        </div>
      </div>
    </div>
  );
  const handleGLBUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const object = await loadGLBModel(file);
        if (object) addObject(object);
      } catch (error) {
        console.error('Error loading GLB:', error);
      }
    }
    if (glbInputRef.current) {
      glbInputRef.current.value = '';
    }
    setIsOpen(false);
  };

  const handlePLYUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.ply')) {
      console.error('Unsupported file type. Please upload a .ply file');
      return;
    }

    setIsLoading(true);
    try {
      const url = URL.createObjectURL(file);
      const viewer = new GaussianSplats3D.DropInViewer({
        gpuAcceleratedSort: false,
        selfDrivenMode: true,
        ignoreDevicePixelRatio: true,
        sharedMemoryForWorkers: typeof SharedArrayBuffer !== 'undefined',
        integerBasedSort: false,
        halfPrecisionCovariancesOnGPU: true,
        dynamicScene: true,
        webXRMode: GaussianSplats3D.WebXRMode.None,
        renderMode: GaussianSplats3D.RenderMode.OnChange,
        splatSortDistanceMapPrecision: 32,
        logLevel: GaussianSplats3D.LogLevel.Debug
      });
      
      await viewer.addSplatScene(url, {
        splatAlphaRemovalThreshold: 1,
        showLoadingUI: false,
        position: [0, 0, 0],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
        format: GaussianSplats3D.SceneFormat.Ply,
        progressiveLoad: true
      });
      
      viewer.rotation.x = Math.PI;
      viewer.userData = {
        objectType: 'Splat',
        isGaussianSplat: true
      };
      
      addObject(viewer);
    } catch (error) {
      console.error('Error loading PLY file:', error);
    } finally {
      setIsLoading(false);
      if (plyInputRef.current) {
        plyInputRef.current.value = '';
      }
      setIsOpen(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const plane = await createMediaPlane(file);
        if (plane) addObject(plane);
      } catch (error) {
        console.error('Error creating media plane:', error);
      }
    }
    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
    setIsOpen(false);
  };

  return (
    <>
      <input
        ref={glbInputRef}
        type="file"
        accept=".glb"
        onChange={handleGLBUpload}
        className="hidden"
      />
      <input
        ref={plyInputRef}
        type="file"
        accept=".ply"
        onChange={handlePLYUpload}
        className="hidden"
      />
      <input
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleMediaUpload}
        className="hidden"
      />
      <ToolbarMenu
        icon={Upload}
        label="Import"
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      >
        <button
          onClick={() => glbInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
        >
          <Box className="w-4 h-4" />
          <span>GLB (.glb)</span>
        </button>
        <button
          onClick={() => plyInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
        >
          <FileCode className="w-4 h-4" />
          <span>Point (.ply)</span>
        </button>
        <div className="h-px bg-gray-700/50 my-1" />
        <button
          onClick={() => mediaInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
        >
          <Image className="w-4 h-4" />
          <span>Image (.jpg)</span>
        </button>
        <button
          onClick={() => mediaInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
        >
          <Film className="w-4 h-4" />
          <span>Video (.mp4)</span>
        </button>
      </ToolbarMenu>
      {isLoading && <CustomLoadingUI />}
    </>
  );
}