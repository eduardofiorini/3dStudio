import { Sun, Sparkle, Disc, Square, Flashlight } from 'lucide-react';
import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { createDirectionalLight, createAmbientLight, createPointLight, createRectAreaLight, createSpotLight } from '../../../utils/objects';
import { ToolbarMenu } from '../ToolbarMenu';

export function LightButton() {
  const [isOpen, setIsOpen] = useState(false);
  const addObject = useEditorStore((state) => state.addObject);

  const handleCreateLight = (type: string) => {
    let light;
    switch (type) {
      case 'directional':
        light = createDirectionalLight({
          position: { x: 8, y: 10, z: -4 },
          intensity: 6,
          color: '#ffffff'
        });
        break;
      case 'ambient':
        light = createAmbientLight({
          intensity: 1.2,
          color: '#ffffff'
        });
        break;
      case 'point':
        light = createPointLight({
          position: { x: 0, y: 2, z: 0 },
          intensity: 100,
          color: '#ffffff'
        });
        break;
      case 'rect-area':
        light = createRectAreaLight({
          position: { x: 0, y: 0, z: 0 },
          intensity: 5,
          color: '#ffffff'
        });
        break;
    }
    if (light) {
      addObject(light);
      setIsOpen(false);
    }
  };

  return (
    <ToolbarMenu
      icon={Sun}
      label="Light"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      <button
        onClick={() => handleCreateLight('directional')}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Sun className="w-4 h-4" />
        <span>Directional</span>
      </button>
      <button
        onClick={() => handleCreateLight('ambient')}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Sparkle className="w-4 h-4" />
        <span>Ambient</span>
      </button>
      <button
        onClick={() => handleCreateLight('point')}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Disc className="w-4 h-4" />
        <span>Point</span>
      </button>
      <button
        onClick={() => handleCreateLight('rect-area')}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Square className="w-4 h-4" />
        <span>Rectangular</span>
      </button>
      <button
        onClick={() => {
          const light = createSpotLight({
            position: { x: 0, y: 5, z: 0 },
            intensity: 50,
            distance: 10,
            color: '#ffffff'
          });
          addObject(light);
          setIsOpen(false);
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Flashlight className="w-4 h-4" />
        <span>Spotlight</span>
      </button>
    </ToolbarMenu>
  );
}