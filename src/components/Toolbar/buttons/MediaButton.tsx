import { Image, Film } from 'lucide-react';
import { useState, useRef } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { createMediaPlane } from '../../../utils/objects';
import { ToolbarMenu } from '../ToolbarMenu';

export function MediaButton() {
  const [isOpen, setIsOpen] = useState(false);
  const addObject = useEditorStore((state) => state.addObject);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const plane = await createMediaPlane(file);
        addObject(plane);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error creating media plane:', error);
    }
    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleMediaUpload}
        className="hidden"
      />
      <ToolbarMenu
        icon={Image}
        label="Media"
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      >
        <button
          onClick={() => mediaInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
        >
          <Image className="w-4 h-4" />
          <span>Photo</span>
        </button>
        <button
          onClick={() => mediaInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
        >
          <Film className="w-4 h-4" />
          <span>Video</span>
        </button>
      </ToolbarMenu>
    </>
  );
}