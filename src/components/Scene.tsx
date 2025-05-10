import { Physics } from '@react-three/rapier';
import { SceneContent } from './Scene/SceneContent';
import { useTimelineStore } from '../store/timelineStore';

export default function Scene() {
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const currentTime = useTimelineStore((state) => state.currentTime);

  return (
    <Physics 
      gravity={[0, -9.81, 0]} 
      paused={!isPlaying}
      timeStep="vary"
    >
      <SceneContent />
    </Physics>
  );
}