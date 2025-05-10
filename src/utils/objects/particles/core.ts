import * as THREE from 'three';
import { FountainConfig } from './types';

export interface ParticleData {
  positions: Float32Array;
  velocities: Float32Array;
  lifetimes: Float32Array;
  ages: Float32Array;
  colors: Float32Array;
}

export function initializeParticles(particles: THREE.Points, config: FountainConfig) {
  const { count, color, spread, initialBoost, lifetime } = config;

  // Allocate typed arrays
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const lifetimes = new Float32Array(count);
  const ages = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const colorTHREE = new THREE.Color();

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;

    velocities[i * 3 + 0] = (Math.random() - 0.5) * spread.x;
    velocities[i * 3 + 1] = Math.random() * spread.y + initialBoost;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * spread.z;

    // Always use lifetimeRange if it exists
    const minLife = config.lifetimeRange?.minLifetime ?? config.lifetime.min;
    const maxLife = config.lifetimeRange?.maxLifetime ?? config.lifetime.max;
    const life = minLife + Math.random() * (maxLife - minLife);
    lifetimes[i] = life;
    ages[i] = Math.random() * life;

    // Initial color
    colorTHREE.setHSL(color.hue, color.saturation, color.lightness);
    colors[i * 3 + 0] = colorTHREE.r;
    colors[i * 3 + 1] = colorTHREE.g;
    colors[i * 3 + 2] = colorTHREE.b;
  }

  particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleData: ParticleData = {
    positions,
    velocities,
    lifetimes,
    ages,
    colors,
  };
  particles.userData.particles = particleData;
}