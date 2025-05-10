import { Upload } from 'lucide-react';
import { useRef } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { loadGLBModel } from '../../../utils/objects';

export function GLBButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addObject = useEditorStore((state) => state.addObject);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb"
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
      >
        <Upload className="w-4 h-4" />
        <span>GLB</span>
      </button>
    </>
  );
}