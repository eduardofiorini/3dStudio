import { PhysicsProps } from '@react-three/rapier';

export const DEFAULT_PHYSICS_CONFIG: PhysicsProps = {
  gravity: [0, -9.81, 0],
  timeStep: 1/60,
  interpolate: true
};

export function getPhysicsConfig(running: boolean, paused: boolean): PhysicsProps {
  return {
    ...DEFAULT_PHYSICS_CONFIG,
    paused: !running || paused,
    debug: running
  };
}