import { MoveIcon, RotateCwIcon, MaximizeIcon } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { cn } from '../../utils/cn';

export default function TransformControls() {
  const transformMode = useEditorStore((state) => state.transformMode);
  const setTransformMode = useEditorStore((state) => state.setTransformMode);

  const buttonClass = "p-2 text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors";
  const activeClass = "bg-blue-500/20 text-blue-300";

  return (
    <div className="flex gap-1 bg-[#252526] rounded-md p-1">
      <button
        onClick={() => setTransformMode('translate')}
        className={cn(buttonClass, transformMode === 'translate' && activeClass)}
        title="Translate (W)"
      >
        <MoveIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTransformMode('rotate')}
        className={cn(buttonClass, transformMode === 'rotate' && activeClass)}
        title="Rotate (E)"
      >
        <RotateCwIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTransformMode('scale')}
        className={cn(buttonClass, transformMode === 'scale' && activeClass)}
        title="Scale (R)"
      >
        <MaximizeIcon className="w-4 h-4" />
      </button>
    </div>
  );
}