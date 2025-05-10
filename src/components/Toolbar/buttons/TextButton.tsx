import { Type, Box } from 'lucide-react';
import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { createText } from '../../../utils/objects';
import { ToolbarMenu } from '../ToolbarMenu';

export function TextButton() {
  const [isOpen, setIsOpen] = useState(false);
  const addObject = useEditorStore((state) => state.addObject);

  const handleCreateText = async (is3D: boolean) => {
    const textObject = await createText({
      text: 'Text',
      size: 1,
      height: is3D ? 0.2 : 0.001,
      material: {
        color: '#e0e0e0',
        metalness: 0,
        roughness: 0.4
      }
    });
    addObject(textObject);
    setIsOpen(false);
  };

  return (
    <ToolbarMenu
      icon={Type}
      label="Text"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      <button
        onClick={() => handleCreateText(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Box className="w-4 h-4" />
        <span>3D Text</span>
      </button>
      <button
        onClick={() => handleCreateText(false)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Type className="w-4 h-4" />
        <span>2D Text</span>
      </button>
    </ToolbarMenu>
  );
}