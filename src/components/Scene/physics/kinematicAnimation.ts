import { Object3D } from 'three';
import { RigidBodyApi } from '@react-three/rapier';
import { Animation } from '../../../types/editor';

export function handleKinematicAnimation(
  api: RigidBodyApi,
  object: Object3D,
  animations: Animation[],
  currentTime: number
) {
  const animation = animations.find(a => a.objectId === object.uuid);
  if (!animation?.keyframes.length) return;

  const keyframes = animation.keyframes;
  if (keyframes.length < 2) return;

  // Find surrounding keyframes
  let prevKeyframe = keyframes[0];
  let nextKeyframe = keyframes[1];

  for (let i = 1; i < keyframes.length; i++) {
    if (keyframes[i].time > currentTime) {
      prevKeyframe = keyframes[i - 1];
      nextKeyframe = keyframes[i];
      break;
    }
  }

  // Interpolate position
  const t = (currentTime - prevKeyframe.time) / (nextKeyframe.time - prevKeyframe.time);
  const position = {
    x: prevKeyframe.transform.position.x + (nextKeyframe.transform.position.x - prevKeyframe.transform.position.x) * t,
    y: prevKeyframe.transform.position.y + (nextKeyframe.transform.position.y - prevKeyframe.transform.position.y) * t,
    z: prevKeyframe.transform.position.z + (nextKeyframe.transform.position.z - prevKeyframe.transform.position.z) * t
  };

  api.setNextKinematicTranslation(position);
}