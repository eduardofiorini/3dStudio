import { useTimelineStore } from '../../store/timelineStore';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { PlaybackControls } from './PlaybackControls';
import { TimelineRuler } from './TimelineRuler';
import { KeyframeEditor } from './KeyframeEditor';
import { TimelineErrorBoundary } from './TimelineErrorBoundary';
import { cn } from '../../utils/cn';

const MAX_TIME = 10; // 10 seconds

function TimeDisplay() {
  const currentTime = useTimelineStore((state) => state.currentTime);
  
  return (
    <div className="flex-shrink-0 mx-4 select-none">
      <div className={cn(
        "px-3 py-1.5 rounded-md bg-[#252526] w-[120px]",
        "border border-gray-700/50",
        "flex items-center justify-between",
        "select-none pointer-events-none"
      )}>
        <span className="text-xs text-gray-400">Frame:</span>
        <span className="text-blue-400 font-mono tabular-nums w-[48px] text-right">
          {currentTime.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export default function Timeline() {
  const setCurrentTime = useTimelineStore((state) => state.setCurrentTime);
  useAnimationFrame();

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    setCurrentTime(percentage * MAX_TIME);
  };

  return (
    <TimelineErrorBoundary>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#1e1e1e] border-t border-gray-700/50 flex items-center px-4 z-30">
        <PlaybackControls />
        <TimelineRuler maxTime={MAX_TIME} onTimelineClick={handleTimelineClick} />
        <TimeDisplay />
      </div>
    </TimelineErrorBoundary>
  );
}