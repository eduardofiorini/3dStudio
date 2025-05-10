import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimelineStore } from '../../store/timelineStore';
import { useEditorStore } from '../../store/editorStore';
import { cn } from '../../utils/cn';

export function PlaybackControls() {
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const currentTime = useTimelineStore((state) => state.currentTime);
  const play = useTimelineStore((state) => state.play);
  const pause = useTimelineStore((state) => state.pause);
  const reset = useTimelineStore((state) => state.reset);
  const objects = useEditorStore((state) => state.objects);

  const handlePlay = () => {
    // Only store initial transforms when starting from frame 0
    if (currentTime === 0) {
      objects.forEach(object => {
        if (object.userData.physicsEnabled) {
          object.userData.initialTransform = {
            position: object.position.clone(),
            rotation: object.rotation.clone(),
            scale: object.scale.clone()
          };
        }
      });
    }

    play();
  };
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => isPlaying ? pause() : handlePlay()}
        className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-white"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>
      
      <button
        onClick={reset}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
          "text-white",
          !isPlaying && currentTime > 0
            ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-200"
            : "bg-gray-800/50 hover:bg-gray-700/50"
        )}
        title="Reset Timeline"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}