import * as THREE from 'three';
import { AnimationMixer } from 'three';

interface AnimationState {
  mixer: AnimationMixer;
  actions: THREE.AnimationAction[];
  isPlaying: boolean;
}

const animationStates = new Map<string, AnimationState>();

export function setupGLBAnimations(model: THREE.Object3D) {
  if (!model.userData.animations?.length) return;

  const mixer = new THREE.AnimationMixer(model);
  const actions = model.userData.animations.map((clip: THREE.AnimationClip) => 
    mixer.clipAction(clip)
  );

  animationStates.set(model.uuid, {
    mixer,
    actions,
    isPlaying: false
  });
}

export function playGLBAnimation(model: THREE.Object3D) {
  const state = animationStates.get(model.uuid);
  if (!state) return;

  state.actions.forEach(action => action.play());
  state.isPlaying = true;
}

export function pauseGLBAnimation(model: THREE.Object3D) {
  const state = animationStates.get(model.uuid);
  if (!state) return;

  state.actions.forEach(action => action.stop());
  state.isPlaying = false;
}

export function updateGLBAnimations(delta: number) {
  animationStates.forEach(state => {
    if (state.isPlaying) {
      state.mixer.update(delta);
    }
  });
}

export function cleanupGLBAnimations(model: THREE.Object3D) {
  const state = animationStates.get(model.uuid);
  if (state) {
    state.actions.forEach(action => action.stop());
    state.mixer.stopAllAction();
    state.mixer.uncacheRoot(model);
    animationStates.delete(model.uuid);
  }
}