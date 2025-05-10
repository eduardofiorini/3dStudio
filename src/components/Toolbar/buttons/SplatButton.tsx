import { Upload } from 'lucide-react';
import { useRef } from 'react';
import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { cn } from '../../../utils/cn';

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

export function SplatButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addObject = useEditorStore((state) => state.addObject);
  const [isLoading, setIsLoading] = useState(false);

  const getViewerConfig = () => {
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    
    return {
      gpuAcceleratedSort: false,
      selfDrivenMode: true,
      ignoreDevicePixelRatio: true,
      sharedMemoryForWorkers: hasSharedArrayBuffer,
      integerBasedSort: false,
      halfPrecisionCovariancesOnGPU: true,
      dynamicScene: true,
      webXRMode: GaussianSplats3D.WebXRMode.None,
      renderMode: GaussianSplats3D.RenderMode.OnChange,
      splatSortDistanceMapPrecision: 32,
      logLevel: GaussianSplats3D.LogLevel.Debug
    };
  };

  const loadPLY = async (file: File) => {
    const url = URL.createObjectURL(file);
    console.log('Loading PLY from URL:', url);

    setIsLoading(true);
    try {
      const viewer = new GaussianSplats3D.DropInViewer(getViewerConfig());
      
      await viewer.addSplatScene(url, {
        splatAlphaRemovalThreshold: 1,
        showLoadingUI: false, // Disable default loading UI
        position: [0, 0, 0], 
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
        format: GaussianSplats3D.SceneFormat.Ply,
        progressiveLoad: true
      });
      
      console.log('PLY scene loaded successfully');
      
      // Rotate the viewer group 180 degrees around X axis
      viewer.rotation.x = Math.PI;
      
      viewer.userData = {
        objectType: 'Splat',
        isGaussianSplat: true
      };
      
      addObject(viewer);
    } catch (error) {
      console.error('Error loading PLY scene:', error);
      throw error;
    } finally {
      URL.revokeObjectURL(url);
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!file.name.toLowerCase().endsWith('.ply')) {
      console.error('Unsupported file type. Please upload a .ply file');
      return;
    }

    try {
      await loadPLY(file);
    } catch (error) {
      console.error('Error loading PLY file:', error);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ply"
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
        title="Upload PLY file with gaussian splat data"
      >
        <Upload className="w-4 h-4" />
        <span>Splat</span>
      </button>
      {isLoading && <CustomLoadingUI />}
    </>
  );
}