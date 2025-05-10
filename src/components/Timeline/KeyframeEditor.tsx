import { useTimelineStore } from '../../store/timelineStore';
import { useEditorStore } from '../../store/editorStore';
import { Circle, MoveIcon, RotateCwIcon, MaximizeIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Transform } from '../../types/editor';

interface TransformKeyframeButtonProps {
  type: keyof Transform;
  icon: React.ReactNode;
  title: string;
  hasKeyframe: boolean;
  onToggle: (type: keyof Transform) => void;
}

function TransformKeyframeButton({ type, icon, title, hasKeyframe, onToggle }: TransformKeyframeButtonProps) {
  return (
    <button
      onClick={() => onToggle(type)}
      className={cn(
        'w-6 h-6 flex items-center justify-center rounded-full',
        'hover:bg-gray-700/50 transition-colors',
        hasKeyframe ? 'text-orange-400' : 'text-gray-500'
      )}
      title={`${hasKeyframe ? 'Remove' : 'Add'} ${title} Keyframe`}
    >
      {icon}
    </button>
  );
}

export function KeyframeEditor() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const currentTime = useTimelineStore((state) => state.currentTime);
  const animations = useTimelineStore((state) => state.animations);
  const addKeyframe = useTimelineStore((state) => state.addKeyframe);
  const removeKeyframe = useTimelineStore((state) => state.removeKeyframe);

  if (!selectedObject) return null;

  const animation = animations.find(a => a.objectId === selectedObject.uuid);
  const keyframesAtTime = animation?.keyframes.filter(k => k.time === currentTime) || [];

  const handleKeyframeToggle = (transformType: keyof Transform) => {
    try {
      if (!animation) {
        console.warn('No animation found for selected object');
        return;
      }

      const existingKeyframe = keyframesAtTime.find(k => k.transformType === transformType);
      
      if (existingKeyframe) {
        // Only remove this specific transform's keyframe
        removeKeyframe(animation.id, currentTime, transformType);
      } else {
        // Create a full transform but only animate the selected property
        const transform: Transform = {
          position: selectedObject.position.clone(),
          rotation: selectedObject.rotation.clone(),
          scale: selectedObject.scale.clone()
        };

        addKeyframe(animation.id, {
          time: currentTime,
          transform,
          easing: 'linear',
          transformType // Add this to track which transform was keyframed
        });
      }
    } catch (error) {
      console.error('Failed to toggle keyframe:', error);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <TransformKeyframeButton
        type="position"
        icon={<MoveIcon className="w-3.5 h-3.5" />}
        title="Position"
        hasKeyframe={keyframesAtTime.some(k => k.transformType === 'position')}
        onToggle={handleKeyframeToggle}
      />
      <TransformKeyframeButton
        type="rotation"
        icon={<RotateCwIcon className="w-3.5 h-3.5" />}
        title="Rotation"
        hasKeyframe={keyframesAtTime.some(k => k.transformType === 'rotation')}
        onToggle={handleKeyframeToggle}
      />
      <TransformKeyframeButton
        type="scale"
        icon={<MaximizeIcon className="w-3.5 h-3.5" />}
        title="Scale"
        hasKeyframe={keyframesAtTime.some(k => k.transformType === 'scale')}
        onToggle={handleKeyframeToggle}
      />
    </div>
  );
}