import { Object3D } from 'three';
import { useEditorStore } from '../../store/editorStore';
import { useTimelineStore } from '../../store/timelineStore';
import { storeInitialTransform } from './transforms';

export function resetObjectToInitialState(object: Object3D) {
  const initialTransform = object.userData.initialTransform;
  if (initialTransform) {
    // Reset transform to initial state
    object.position.copy(initialTransform.position);
    object.rotation.copy(initialTransform.rotation);
    object.scale.copy(initialTransform.scale);
    
    // Force matrix updates
    object.updateMatrix();
    object.updateMatrixWorld(true);

    // Clear any physics state
    object.userData.physicsBody = null;
  }
}

export function resetAllObjects() {
  const objects = useEditorStore.getState().objects;

  objects.forEach(object => {
    if (object.userData.physicsEnabled) {
      resetObjectToInitialState(object);
    }
  });

  // Force a transform update to refresh the UI
  useEditorStore.getState().updateTransform();
}