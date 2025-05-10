import { useMemo } from 'react';

interface PhysicsConfig {
  restitution: number;
  friction: number;
  mass: number;
}

export function usePhysicsConfig(isStatic: boolean): PhysicsConfig {
  return useMemo(() => ({
    restitution: 1,
    friction: 0,
    mass: isStatic ? 0 : 1
  }), [isStatic]);
}