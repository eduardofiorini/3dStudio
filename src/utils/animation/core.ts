import { Animation, Keyframe, Transform } from '../../types/editor';
import * as THREE from 'three';
import { useTimelineStore } from '../../store/timelineStore';
import { interpolateTransforms } from './interpolation';

export function updateObjectsAtTime(
  time: number,
  animations: Animation[],
  objects: THREE.Object3D[],
  maxUpdatesPerFrame = 1000
) {
  let updateCount = 0;

  animations.forEach((animation) => {
    if (updateCount >= maxUpdatesPerFrame) {
      console.warn('Timeline: Max updates per frame reached');
      return;
    }

    const object = objects.find((obj) => obj.uuid === animation.objectId);
    if (!object) return;

    try {
      // Get current transform as base state
      const currentTransform: Transform = {
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone()
      };

      // Handle each transform type separately
      ['position', 'rotation', 'scale'].forEach((transformType) => {
        // Filter keyframes for this transform type
        const typeKeyframes = animation.keyframes.filter(
          k => k.transformType === transformType
        ).sort((a, b) => a.time - b.time);

        // If no keyframes for this transform type, keep current transform
        if (typeKeyframes.length === 0) {
          return;
        }

        // If only one keyframe, use its transform
        if (typeKeyframes.length === 1) {
          currentTransform[transformType] = typeKeyframes[0].transform[transformType];
          return;
        }

        // Find surrounding keyframes
        let prevKeyframe = typeKeyframes[0];
        let nextKeyframe = typeKeyframes[1];

        for (let i = 1; i < typeKeyframes.length; i++) {
          if (typeKeyframes[i].time > time) {
            prevKeyframe = typeKeyframes[i - 1];
            nextKeyframe = typeKeyframes[i];
            break;
          }
        }

        // Interpolate this transform type
        if (time <= prevKeyframe.time) {
          currentTransform[transformType] = prevKeyframe.transform[transformType];
        } else if (time >= typeKeyframes[typeKeyframes.length - 1].time) {
          currentTransform[transformType] = typeKeyframes[typeKeyframes.length - 1].transform[transformType];
        } else {
          const interpolated = interpolateTransforms(prevKeyframe, nextKeyframe, time, transformType as keyof Transform);
          currentTransform[transformType] = interpolated[transformType];
        }
      });

      // Apply the final combined transform
      applyTransform(object, currentTransform);
      updateCount++;
    } catch (error) {
      console.error('Timeline: Animation error:', error);
      if (useTimelineStore.getState().checkErrorThreshold()) {
        return;
      }
    }
  });
}

function applyTransform(object: THREE.Object3D, transform: Transform) {
  useTimelineStore.getState().updateObjectTransform(object, transform);
}