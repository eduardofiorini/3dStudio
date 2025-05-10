import { Camera } from 'lucide-react';
import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { createPerspectiveCamera } from '../../../utils/objects/camera';
import { ToolbarMenu } from '../ToolbarMenu';

export function CameraButton() {
  const [isOpen, setIsOpen] = useState(false);
  const addObject = useEditorStore((state) => state.addObject);

  const handleCreateCamera = () => {
    const camera = createPerspectiveCamera({
      position: { x: 0, y: 2, z: 4 },
      fov: 50,
      near: 0.2,
      far: 100,
      showHelper: true
    });

    addObject(camera);
    setIsOpen(false);
  };

  return (
    <ToolbarMenu
      icon={Camera}
      label="Camera"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      <button
        onClick={handleCreateCamera}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Camera className="w-4 h-4" />
        <span>Perspective Camera</span>
      </button>
    </ToolbarMenu>
  );
}