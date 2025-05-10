import { useEffect, useRef } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import { useEditorStore } from '../store/editorStore';
import { updateObjectsAtTime } from '../utils/animation';

export function useAnimationFrame() {
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const currentTime = useTimelineStore((state) => state.currentTime);
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const animations = useTimelineStore((state) => state.animations);
  const setCurrentTime = useTimelineStore((state) => state.setCurrentTime);
  const reset = useTimelineStore((state) => state.reset);
  const objects = useEditorStore((state) => state.objects);
  const physics = useEditorStore((state) => state.physics);

  // Update objects and sync physics time when timeline position changes
  useEffect(() => {
    // If currentTime is reset to 0, also reset the time reference
    if (currentTime === 0) {
      lastTimeRef.current = 0;
    }

    // Update objects' transformations according to animations at the current time
    updateObjectsAtTime(currentTime, animations, objects);

  }, [currentTime, animations, objects]);

  // Start/stop the animation frame loop based on isPlaying
  useEffect(() => {
    if (!isPlaying) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      return;
    }

    // Reset lastTimeRef to prevent large deltaTime on resume
    lastTimeRef.current = 0;

    const animate = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }

      const deltaTime = (time - lastTimeRef.current) / 1000;
      const newTime = currentTime + deltaTime;

      setCurrentTime(newTime);
      lastTimeRef.current = time;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isPlaying, currentTime, animations, objects, setCurrentTime]);
}
