import { useTimelineStore } from '../../store/timelineStore';
import { cn } from '../../utils/cn';
import { useState, useCallback, useRef, useEffect } from 'react';

interface TimelineRulerProps {
  maxTime: number;
  onTimelineClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  animationId: string;
  time: number;
  transformType?: string;
}

interface DragState {
  animationId: string;
  time: number;
  transformType?: string;
}

export function TimelineRuler({ maxTime, onTimelineClick }: TimelineRulerProps) {
  const currentTime = useTimelineStore((state) => state.currentTime);
  const animations = useTimelineStore((state) => state.animations);
  const updateKeyframeTime = useTimelineStore((state) => state.updateKeyframeTime);
  const removeKeyframe = useTimelineStore((state) => state.removeKeyframe);
  const TIMELINE_PADDING = 0.2;
  const [draggedKeyframe, setDraggedKeyframe] = useState<DragState | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedKeyframe) return; // Don't handle clicks during drag
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    
    // Calculate percentage including padding offset, matching playhead calculation
    const paddingOffset = (TIMELINE_PADDING / (maxTime + TIMELINE_PADDING)) * timelineWidth;
    const effectiveWidth = timelineWidth - paddingOffset;
    const percentage = (clickX - paddingOffset) / effectiveWidth;
    
    // Clamp percentage and convert to time
    const clampedPercentage = Math.max(0, Math.min(1, percentage));
    const time = clampedPercentage * maxTime;
    useTimelineStore.getState().setCurrentTime(time);
  };
  // Calculate playhead position with fixed precision
  const playheadPosition = (() => {
    const rawPosition = ((currentTime + TIMELINE_PADDING) / (maxTime + TIMELINE_PADDING)) * 100;
    return Math.max(
      (TIMELINE_PADDING / (maxTime + TIMELINE_PADDING)) * 100,
      Number(rawPosition.toFixed(3))
    );
  })();

  const getTimeFromMousePosition = useCallback((mouseX: number, rect: DOMRect) => {
    const timelineWidth = rect.width;
    const paddingOffset = (TIMELINE_PADDING / (maxTime + TIMELINE_PADDING)) * timelineWidth;
    const effectiveWidth = timelineWidth - paddingOffset;
    const percentage = (mouseX - paddingOffset) / effectiveWidth;
    const clampedPercentage = Math.max(0, Math.min(1, percentage));
    return clampedPercentage * maxTime;
  }, [maxTime]);

  const handleKeyframeMouseDown = (e: React.MouseEvent, animationId: string, time: number, transformType?: string) => {
    e.stopPropagation();
    setDraggedKeyframe({ animationId, time, transformType });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedKeyframe) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const newTime = getTimeFromMousePosition(mouseX, rect);
    
    updateKeyframeTime(
      draggedKeyframe.animationId,
      draggedKeyframe.time,
      newTime,
      draggedKeyframe.transformType
    );
    
    setDraggedKeyframe({ ...draggedKeyframe, time: newTime });
  };

  const handleMouseUp = () => {
    setDraggedKeyframe(null);
  };

  const handleContextMenu = (e: React.MouseEvent, animationId: string, time: number, transformType?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      animationId,
      time,
      transformType
    });
  };

  const handleDeleteKeyframe = () => {
    if (!contextMenu) return;
    removeKeyframe(contextMenu.animationId, contextMenu.time, contextMenu.transformType);
    setContextMenu(null);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div
      className="flex-1 mx-4 h-12 bg-[#252526] rounded-lg relative flex flex-col overflow-hidden shadow-inner select-none"
      onClick={handleTimelineClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zero marker line */}
      <div 
        className="absolute top-0 bottom-0 w-[1px] bg-gray-500/30 z-20"
        style={{ 
          left: `${Number((TIMELINE_PADDING / (maxTime + TIMELINE_PADDING)) * 100).toFixed(3)}%`
        }}
      >
        <span className="absolute -top-6 left-1 text-[10px] font-medium text-gray-400">0</span>
      </div>

      {/* Time markers */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 border-l border-gray-700/50 first:border-l-0 relative"
          >
            <span className="absolute -top-6 left-0 text-[10px] font-medium text-gray-500/50 select-none">
              {i}
            </span>
          </div>
        ))}
      </div>

      {/* Keyframe markers */}
      {animations.map(animation => (
        animation.keyframes.map(keyframe => (
          <div
            key={`${animation.id}-${keyframe.time}-${keyframe.transformType || 'all'}`}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-3 h-3",
              "bg-orange-500/90 rounded-full cursor-move",
              "hover:scale-110 hover:bg-orange-400 active:scale-95",
              "transition-all duration-150 ease-out",
              "shadow-lg shadow-orange-500/20",
              "ring-2 ring-orange-600/30"
            )}
            onMouseDown={(e) => handleKeyframeMouseDown(e, animation.id, keyframe.time, keyframe.transformType)}
            onContextMenu={(e) => handleContextMenu(e, animation.id, keyframe.time, keyframe.transformType)}
            style={{
              left: `${((keyframe.time + TIMELINE_PADDING) / (maxTime + TIMELINE_PADDING)) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))
      ))}

      {/* Playhead */}
      <div 
        className="absolute top-0 bottom-0 w-[1px] bg-blue-500 z-10 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        style={{ 
          left: `${playheadPosition}%`,
          transition: 'none'
        }}
      />
      
      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-[#252526] rounded-md shadow-lg border border-gray-700/50 py-1"
          style={{ 
            left: contextMenu.x, 
            top: contextMenu.y 
          }}
        >
          <button
            onClick={handleDeleteKeyframe}
            className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-gray-700/50"
          >
            Delete Keyframe
          </button>
        </div>
      )}
    </div>
  );
}