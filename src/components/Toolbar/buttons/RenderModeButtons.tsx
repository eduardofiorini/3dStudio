import { CircleDashed, Circle, CircleDot } from 'lucide-react';
import { useEditorStore } from '../../../store/editorStore';
import { cn } from '../../../utils/cn';
import { RenderMode } from '../../../store/slices/renderModeSlice';

export function RenderModeButtons() {
  const renderMode = useEditorStore((state) => state.renderMode);
  const setRenderMode = useEditorStore((state) => state.setRenderMode);

  const buttons: Array<{
    mode: RenderMode;
    icon: typeof Circle;
    label: string;
  }> = [
    { mode: 'wireframe', icon: CircleDashed, label: 'Wireframe' },
    { mode: 'clay', icon: Circle, label: 'Clay' },
    { mode: 'normal', icon: CircleDot, label: 'Normal' }
  ];

  return (
    <div className="flex items-center gap-0.5">
      {buttons.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setRenderMode(mode)}
          className={cn(
            "flex items-center px-2 py-1.5 text-sm rounded-md transition-colors",
            renderMode === mode
              ? "bg-blue-500/20 text-blue-300"
              : "text-gray-300 hover:bg-gray-700/50"
          )}
          title={`Switch to ${label} Mode`}
        >
          <Icon className="w-4 h-4 stroke-[2.5]" />
        </button>
      ))}
    </div>
  );
}