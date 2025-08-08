import { Circle, MoveIcon, RotateCwIcon, MaximizeIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useTimelineStore } from '../../store/timelineStore';
import { formatNumber, parseNumber } from '../../utils/formatters';
import { useDragInput } from '../../hooks/useDragInput';
import { cn } from '../../utils/cn';
import { v4 as uuidv4 } from 'uuid';
import { Lock, Unlock } from 'lucide-react';

interface TransformGroupProps {
  title: string;
  values: { x: number; y: number; z: number };
  onChange: (axis: 'x' | 'y' | 'z', value: number) => void;
  step?: number;
  min?: number;
  isHighlighted?: boolean;
}

interface InputState {
  value: string;
  axis: 'x' | 'y' | 'z';
}

export function TransformGroup({ 
  title, 
  values, 
  onChange, 
  step = 0.1, 
  min, 
  isHighlighted 
}: TransformGroupProps) {
  const transformUpdate = useEditorStore((state) => state.transformUpdate);
  const undoCount = useEditorStore((state) => state.undoStack.length);
  const redoCount = useEditorStore((state) => state.redoStack.length);

  const selectedObject = useEditorStore((state) => state.selectedObject);
  const currentTime = useTimelineStore((state) => state.currentTime);
  const isPhysicsEnabled = selectedObject?.userData.physicsEnabled;
  const isKinematic = selectedObject?.userData.physicsType === 'kinematic';
  const isTransformLocked = selectedObject?.userData.transformLocked;
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  
  const [inputState, setInputState] = useState<InputState | null>(null);
  const [isScaleLocked, setIsScaleLocked] = useState(selectedObject?.userData.scaleLocked ?? true);
  
  // Transform disable logic:
  // - Always respect transform lock
  // - When physics simulation is running:
  //   - Only kinematic objects can be moved (position only)
  //   - No objects can be rotated or scaled
  // - When simulation is stopped: all objects can be transformed
  const isTransformDisabled = isTransformLocked || (isPhysicsEnabled && isPlaying && (
    !isKinematic || // Non-kinematic objects can't be transformed during simulation
    (title.toLowerCase() === 'rotation' || title.toLowerCase() === 'scale') // No rotation/scale during simulation
  ));

  const getIcon = () => {
    switch (title.toLowerCase()) {
      case 'location':
        return <MoveIcon className="w-3.5 h-3.5 text-gray-400" />;
      case 'rotation':
        return <RotateCwIcon className="w-3.5 h-3.5 text-gray-400" />;
      case 'scale':
        return <MaximizeIcon className="w-3.5 h-3.5 text-gray-400" />;
      default:
        return null;
    }
  };

  const addKeyframe = useTimelineStore((state) => state.addKeyframe);
  const animations = useTimelineStore((state) => state.animations);
  const addAnimation = useTimelineStore((state) => state.addAnimation);

  const toggleKeyframe = (axis: 'x' | 'y' | 'z') => {
    if (!selectedObject) return;

    const transformType = title === 'Location' ? 'position' : title.toLowerCase();

    // Find existing animation or create new one
    let animation = animations.find(a => a.objectId === selectedObject.uuid);
    
    if (!animation) {
      animation = {
        id: uuidv4(),
        objectId: selectedObject.uuid,
        keyframes: [],
        duration: 0,
        isPlaying: false
      };
      addAnimation(animation);
    }

    // Check if keyframe already exists for this transform type
    const existingKeyframe = animation.keyframes.find(k => 
      k.time === currentTime && k.transformType === transformType
    );

    if (existingKeyframe) {
      // Remove keyframe for this transform type
      useTimelineStore.getState().removeKeyframe(animation.id, currentTime, transformType);
      return;
    }

    // Create keyframe
    const keyframe = {
      time: currentTime,
      transform: {
        position: {
          x: selectedObject.position.x,
          y: selectedObject.position.y,
          z: selectedObject.position.z
        },
        rotation: {
          x: selectedObject.rotation.x,
          y: selectedObject.rotation.y,
          z: selectedObject.rotation.z
        },
        scale: {
          x: selectedObject.scale.x,
          y: selectedObject.scale.y,
          z: selectedObject.scale.z
        }
      },
      easing: 'linear',
      transformType // Add transform type to track which property is keyframed
    };

    addKeyframe(animation.id, keyframe);
  };

const handleChange = (axis: 'x' | 'y' | 'z', value: string) => {
  setInputState({ value, axis });
};

const commitChange = (value: string, axis: 'x' | 'y' | 'z') => {
  const parsedValue = parseNumber(value);
  if (!Number.isFinite(parsedValue)) {
    return;
  }
  onChange(axis, parsedValue);
  setInputState(null);
};

  // Check if current time has a keyframe for this object
  const hasKeyframe = (): boolean => {
    if (!selectedObject) return false;
    
    const animation = animations.find(a => a.objectId === selectedObject.uuid);
    if (!animation) return false;

    // Only check for keyframes of this specific transform type
    return animation.keyframes.some(k => 
      k.time === currentTime && 
      k.transformType === (title === 'Location' ? 'position' : title.toLowerCase())
    );
  };

  const handleLockToggle = () => {
    const newLockState = !isScaleLocked;
    setIsScaleLocked(newLockState);
    // Store lock state in object's userData
    if (selectedObject) {
      selectedObject.userData.scaleLocked = newLockState;
    }
  };

  return (
    <div className="mb-2 text-gray-400">
      <div className="flex items-center justify-between mb-2 pl-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-2 text-gray-500">
          {getIcon()}
          <div className="flex items-center gap-2">
            {title}
            {isTransformDisabled && (
              <span className="text-[10px] text-yellow-500/80 whitespace-nowrap">
                {isTransformLocked
                  ? "(transforms locked)"
                  : "(disable physics)"}
              </span>
            )}
          </div>
          </span>
          {title === 'Scale' && (
            <button
              onClick={handleLockToggle}
              className={cn(
                "p-1 rounded hover:bg-gray-700/30 transition-colors",
                isScaleLocked ? "text-blue-400" : "text-gray-500"
              )}
              title={isScaleLocked ? "Uniform Scaling (Locked)" : "Non-uniform Scaling (Unlocked)"}
            >
              {isScaleLocked ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Unlock className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
        <button
          onClick={() => toggleKeyframe(title === 'Location' ? 'position' : title.toLowerCase())}
          className={cn( 
            'w-3.5 h-3.5 flex items-center justify-center rounded-full',
            'hover:bg-gray-700/50',
            hasKeyframe() ? 'text-orange-400' : 'text-gray-500'
          )}
          title={`${hasKeyframe() ? 'Remove' : 'Add'} ${title} Keyframe`}
        >
          <Circle className="w-1.5 h-1.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1">
            {(['x', 'y', 'z'] as const).map((axis) => {
              const { handleMouseDown, handleClick, isDragging } = useDragInput({
                onChange: (value) => onChange(axis, value),
                onDragChange: (value) => {
                  // If scale is locked, update all axes during drag
                  if (isScaleLocked && title === 'Scale') {
                    onChange('x', value);
                    onChange('y', value);
                    onChange('z', value);
                  } else {
                    onChange(axis, value);
                  }
                },
                transformType: title.toLowerCase() as 'position' | 'rotation' | 'scale',
                step,
                min
              });

              return (
                <div key={axis} className="relative">
                  <div className="relative flex items-center">
                    <span className="absolute left-2 text-xs font-medium text-gray-500 pointer-events-none">
                      {axis.toLowerCase()}
                    </span>
                    <input
                      type="text"
                      value={inputState?.axis === axis ? inputState.value : Number(values[axis]).toFixed(1)}
                      disabled={isTransformDisabled}
                      onChange={(e) => {
                        handleChange(axis, e.target.value);
                        // If scale is locked, update all axes
                        if (isScaleLocked && title === 'Scale') {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            onChange('x', value);
                            onChange('y', value);
                            onChange('z', value);
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputState) {
                          commitChange(inputState.value, inputState.axis);
                        }
                      }}
                      onBlur={() => {
                        if (inputState?.axis === axis) {
                          commitChange(inputState.value, axis);
                        }
                      }}
                      onMouseDown={(e) => handleMouseDown(e, values[axis])}
                      onClick={(e) => handleClick(e)}
                      step={0.1}
                      min={min}
                      className={cn(
                        "w-full py-2 pl-6 pr-2 bg-[#1e1e1e] border border-gray-700/50 rounded text-sm",
                        "cursor-ew-resize select-none text-right",
                        "focus:outline-none focus:ring-1",
                        isHighlighted ? "border-blue-500/50 focus:ring-blue-500/50" : "focus:ring-gray-500/50",
                        isDragging && "opacity-50",
                        isTransformDisabled && "opacity-50 cursor-not-allowed bg-gray-800/30 text-gray-500"
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
    </div>
  );
}