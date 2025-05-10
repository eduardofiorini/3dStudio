import React, { useState, useEffect, useRef } from 'react';
import { Box, Sparkle, Cone, Square, Upload, Cylinder, Scan, Type, Image, Film, Grid, Sun, Disc, Circle, Droplets, Flame, Snowflake, Cloud } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { 
  createCube, createSphere, createCylinder, createCone, createTorus, createPlane, 
  createEmptyEntity, createText, createMediaPlane, createPointLight, createDirectionalLight, 
  createAmbientLight, createRectAreaLight, createParticleFountain, createParticleFire,
  createParticleSnow, createParticleDust
} from '../utils/objects';
import { ArrayModifierDialog } from './Toolbar/ArrayModifierDialog';
import { loadGLBModel } from '../utils/objectCreators';
import TransformControls from './Toolbar/TransformControls';
import TextDialog from './Toolbar/TextDialog';

export default function Toolbar() {
  const addObject = useEditorStore((state) => state.addObject);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const [showShapes, setShowShapes] = useState(false);
  const [showParticlesMenu, setShowParticlesMenu] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showTextMenu, setShowTextMenu] = useState(false);
  const [showArrayDialog, setShowArrayDialog] = useState(false);
  const [showLightMenu, setShowLightMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const buttonClass = "p-2 text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors";
  const activeClass = "bg-blue-500/20 text-blue-300";

  // Refs for menu containers
  const shapesMenuRef = useRef<HTMLDivElement>(null);
  const mediaMenuRef = useRef<HTMLDivElement>(null);
  const textMenuRef = useRef<HTMLDivElement>(null);
  const particlesMenuRef = useRef<HTMLDivElement>(null);
  const lightMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside all menus
      if (shapesMenuRef.current && !shapesMenuRef.current.contains(event.target as Node)) {
        setShowShapes(false);
      }
      if (mediaMenuRef.current && !mediaMenuRef.current.contains(event.target as Node)) {
        setShowMedia(false);
      }
      if (textMenuRef.current && !textMenuRef.current.contains(event.target as Node)) {
        setShowTextMenu(false);
      }
      if (particlesMenuRef.current && !particlesMenuRef.current.contains(event.target as Node)) {
        setShowParticlesMenu(false);
      }
      if (lightMenuRef.current && !lightMenuRef.current.contains(event.target as Node)) {
        setShowLightMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddObject = (creator: () => THREE.Mesh) => {
    addObject(creator());
    setShowShapes(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const object = await loadGLBModel(file);
        addObject(object);
      } catch (error) {
        console.error('Error loading GLB:', error);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return (
    <div className="w-full bg-[#1e1e1e] border-b border-gray-700 px-1.5 py-1.5 z-10">
      <div className="flex items-center gap-1">
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb"
          onChange={handleFileUpload}
          className="hidden"
        />
        <TransformControls />
        <div className="h-6 w-px bg-gray-700 mx-2" />
        <div className="relative" ref={lightMenuRef}>
          <button
            onClick={() => setShowLightMenu(!showLightMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>
          {showLightMenu && (
            <div className="absolute top-full left-0 mt-1 bg-[#252526] rounded-md shadow-lg border border-gray-700 p-2 min-w-[160px]">
              <button
                onClick={() => {
                  const light = createDirectionalLight({
                    position: { x: 8, y: 10, z: -4 },
                    intensity: 6,
                    color: '#ffffff'
                  });
                  addObject(light);
                  setShowLightMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Sun className="w-4 h-4" />
                <span>Directional</span>
              </button>
              <button
                onClick={() => {
                  const light = createAmbientLight({
                    intensity: 1.2,
                    color: '#ffffff'
                  });
                  addObject(light);
                  setShowLightMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Sparkle className="w-4 h-4" />
                <span>Ambient</span>
              </button>
              <button
                onClick={() => {
                  const light = createPointLight({
                    position: { x: 0, y: 2, z: 0 },
                    intensity: 100,
                    color: '#ffffff'
                  });
                  addObject(light);
                  setShowLightMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Disc className="w-4 h-4" />
                <span>Point</span>
              </button>
              <button
                onClick={() => {
                  const light = createRectAreaLight({
                    position: { x: 0, y: 0, z: 0 },
                    intensity: 5,
                    color: '#ffffff'
                  });
                  addObject(light);
                  setShowLightMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Square className="w-4 h-4" />
                <span>Rectangular</span>
              </button>
            </div>
          )}
        </div>
        <div className="h-6 w-px bg-gray-700 mx-2" />
        <div className="relative" ref={shapesMenuRef}>
          <button
            onClick={() => setShowShapes(!showShapes)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
          >
            <Box className="w-4 h-4" />
            <span>Shape</span>
          </button>
          {showShapes && (
            <div className="absolute top-full left-0 mt-1 bg-[#252526] rounded-md shadow-lg border border-gray-700 p-2 grid grid-cols-2 gap-1 min-w-[200px]">
              <button
                onClick={() => handleAddObject(createCube)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
              >
                <Box className="w-4 h-4" />
                <span>Cube</span>
              </button>
              <button
                onClick={() => handleAddObject(createSphere)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
              >
                <div className="w-4 h-4 relative flex items-center justify-center">
                  <Circle className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span>Sphere</span>
              </button>
              <button
                onClick={() => handleAddObject(createCylinder)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
              >
                <div className="w-4 h-4 relative flex items-center justify-center">
                  <Cylinder className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span>Cylinder</span>
              </button>
              <button
                onClick={() => handleAddObject(createCone)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
              >
                
                <Cone className="w-4 h-4" />
                <span>Cone</span>
              </button>
              <button
                onClick={() => handleAddObject(createTorus)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
              >
                <div className="w-4 h-4 relative">
                  <Circle className="w-4 h-4 absolute inset-0" />
                  <Circle className="w-2.5 h-2.5 absolute inset-0 m-auto" />
                </div>
                <span>Torus</span>
              </button>
              <button
                onClick={() => handleAddObject(createPlane)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>Plane</span>
              </button>
              <button
                onClick={() => handleAddObject(createEmptyEntity)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
              >
                <div className="w-4 h-4 relative flex items-center justify-center">
                  <Scan className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span>Empty</span>
              </button>
            </div>
          )}
        </div>
        <div className="h-6 w-px bg-gray-700 mx-2" />
        <div className="relative" ref={mediaMenuRef}>
          <button
            onClick={() => setShowMedia(!showMedia)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
          >
            <Image className="w-4 h-4" />
            <span>Media</span>
          </button>
          {showMedia && (
            <div className="absolute top-full left-0 mt-1 bg-[#252526] rounded-md shadow-lg border border-gray-700 p-2 min-w-[160px]">
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  try {
                    const file = e.target.files?.[0];
                    if (file) {
                      createMediaPlane(file).then(plane => {
                        addObject(plane);
                        setShowMedia(false);
                      });
                    }
                  } catch (error) {
                    console.error('Error creating media plane:', error);
                  }
                  if (mediaInputRef.current) {
                    mediaInputRef.current.value = '';
                  }
                }}
                className="hidden"
              />
              <button
                onClick={() => {
                  mediaInputRef.current?.click();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Image className="w-4 h-4" />
                <span>Photo</span>
              </button>
              <button
                onClick={() => {
                  mediaInputRef.current?.click();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Film className="w-4 h-4" />
                <span>Video</span>
              </button>
            </div>
          )}
        </div>
        <div className="h-6 w-px bg-gray-700 mx-2" />
        <div className="relative" ref={particlesMenuRef}>
          <button
            onClick={() => setShowParticlesMenu(!showParticlesMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
          >
            <Droplets className="w-4 h-4" />
            <span>Particles</span>
          </button>
          {showParticlesMenu && (
            <div className="absolute top-full left-0 mt-1 bg-[#252526] rounded-md shadow-lg border border-gray-700 p-2 min-w-[160px]">
              <button
                onClick={() => {
                  const particles = createParticleFountain();
                  addObject(particles);
                  setShowParticlesMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Sparkle className="w-4 h-4" />
                <span>Fountain</span>
              </button>
              <button
                onClick={() => {
                  const particles = createParticleFire();
                  addObject(particles);
                  setShowParticlesMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Flame className="w-4 h-4" />
                <span>Fire</span>
              </button>
              <button
                onClick={() => {
                  const particles = createParticleSnow();
                  addObject(particles);
                  setShowParticlesMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Snowflake className="w-4 h-4" />
                <span>Snow</span>
              </button>
              <button
                onClick={() => {
                  const particles = createParticleDust();
                  addObject(particles);
                  setShowParticlesMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Cloud className="w-4 h-4" />
                <span>Dust</span>
              </button>
            </div>
          )}
        </div>
        <div className="h-6 w-px bg-gray-700 mx-2" />
        <div className="relative" ref={textMenuRef}>
          <button
            onClick={() => setShowTextMenu(!showTextMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
          >
            <Type className="w-4 h-4" />
            <span>Text</span>
          </button>
          {showTextMenu && (
            <div className="absolute top-full left-0 mt-1 bg-[#252526] rounded-md shadow-lg border border-gray-700 p-2 min-w-[160px]">
              <button
                onClick={() => {
                  createText({
                    text: 'Text',
                    size: 1,
                    height: 0.2,
                    material: {
                      color: '#e0e0e0',
                      metalness: 0,
                      roughness: 0.4
                    }
                  }).then(textObject => {
                    addObject(textObject);
                    setShowTextMenu(false);
                  });
                  setShowTextMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Box className="w-4 h-4" />
                <span>3D Text</span>
              </button>
              <button
                onClick={() => {
                  createText({
                    text: 'Text',
                    size: 1,
                    height: 0.001, // Very thin depth for 2D appearance
                    material: {
                      color: '#e0e0e0',
                      metalness: 0,
                      roughness: 0.4
                    }
                  }).then(textObject => {
                    addObject(textObject);
                    setShowTextMenu(false);
                  });
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
              >
                <Type className="w-4 h-4" />
                <span>2D Text</span>
              </button>
            </div>
          )}
        </div>
        <div className="h-6 w-px bg-gray-700 mx-2" />
        <div className="relative">
          <button
            onClick={() => setShowArrayDialog(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
          >
            <Grid className="w-4 h-4" />
            <span>Array</span>
          </button>
          {showArrayDialog && <ArrayModifierDialog onClose={() => setShowArrayDialog(false)} />}
        </div>
        <div className="h-6 w-px bg-gray-700 mx-2" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>GLB</span>
        </button>
      </div>
    </div>
  );
}