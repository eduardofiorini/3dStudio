import { Keyframe, Transform } from '../../types/editor';
import { lerp } from './math';

export function interpolateTransforms(
  keyframe1: Keyframe,
  keyframe2: Keyframe,
  time: number,
  transformType?: keyof Transform
): Transform {
  const t = (time - keyframe1.time) / (keyframe2.time - keyframe1.time);
  const easedT = getEasing(t, keyframe1.easing);

  // Start with keyframe1's transform as the base
  const result = {
    position: { ...keyframe1.transform.position },
    rotation: { ...keyframe1.transform.rotation },
    scale: { ...keyframe1.transform.scale }
  };

  // Only interpolate the specified transform type if provided
  if (transformType) {
    result[transformType] = {
      x: lerp(keyframe1.transform[transformType].x, keyframe2.transform[transformType].x, easedT),
      y: lerp(keyframe1.transform[transformType].y, keyframe2.transform[transformType].y, easedT),
      z: lerp(keyframe1.transform[transformType].z, keyframe2.transform[transformType].z, easedT)
    };
  } else {
    // Otherwise interpolate all properties
    result.position = {
      x: lerp(keyframe1.transform.position.x, keyframe2.transform.position.x, easedT),
      y: lerp(keyframe1.transform.position.y, keyframe2.transform.position.y, easedT),
      z: lerp(keyframe1.transform.position.z, keyframe2.transform.position.z, easedT)
    };
    result.rotation = {
      x: lerp(keyframe1.transform.rotation.x, keyframe2.transform.rotation.x, easedT),
      y: lerp(keyframe1.transform.rotation.y, keyframe2.transform.rotation.y, easedT),
      z: lerp(keyframe1.transform.rotation.z, keyframe2.transform.rotation.z, easedT)
    };
    result.scale = {
      x: lerp(keyframe1.transform.scale.x, keyframe2.transform.scale.x, easedT),
      y: lerp(keyframe1.transform.scale.y, keyframe2.transform.scale.y, easedT),
      z: lerp(keyframe1.transform.scale.z, keyframe2.transform.scale.z, easedT)
    };
  }

  return result;
}

function getEasing(t: number, type: Keyframe['easing']): number {
  switch (type) {
    case 'linear':
      return t;
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return t * (2 - t);
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    default:
      return t;
  }
}