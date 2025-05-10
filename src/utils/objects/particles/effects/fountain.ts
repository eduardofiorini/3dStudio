import * as THREE from 'three';
import { FountainConfig } from '../../particles/types';
import { initializeParticles } from '../../particles/core';

export function createParticleFountain() {
  const fountainConfig: FountainConfig = {
    count: 1000,
    size: 0.1,
    opacity: 0.8,
    gravity: 0.003,
    spread: { x: 0.15, y: 0.15, z: 0.15 },
    initialBoost: 0.1,
    lifetime: { min: 70, max: 120 },
    color: { hue: 0.6, saturation: 0.8, lightness: 0.5 },
    style: 'textured', // Set default to textured
    speedFactor: 0.5,
    colorRange: {
      enabled: true,
      start: { hue: 0.6, saturation: 0.8, lightness: 0.5 },
      end: { hue: 0.6, saturation: 0.8, lightness: 0.2 }
    }
  };

  const geometry = new THREE.BufferGeometry();

  // Create particle texture
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: fountainConfig.size,
    map: texture,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: fountainConfig.opacity,
    depthWrite: false,
  });

  const particles = new THREE.Points(geometry, material);
  particles.userData.objectType = 'Particles';
  particles.userData.fountainConfig = fountainConfig;

  initializeParticles(particles, fountainConfig);
  particles.userData.animate = createAnimationFunction(particles);

  return particles;
}

function createAnimationFunction(particles: THREE.Points) {
  return function animate() {
    const config = particles.userData.fountainConfig as FountainConfig;
    const { count, gravity, spread, turbulence = 0, initialBoost, color, colorRange, speedFactor = 1 } = config;
    const { positions, velocities, lifetimes, ages, colors } = particles.userData.particles;

    const colorTHREE = new THREE.Color();
    const startColor = new THREE.Color();
    const endColor = new THREE.Color();

    // Pre-compute colors if using color range
    if (colorRange?.enabled) {
      startColor.setHSL(
        colorRange.start.hue,
        colorRange.start.saturation,
        colorRange.start.lightness
      );
      endColor.setHSL(
        colorRange.end.hue,
        colorRange.end.saturation,
        colorRange.end.lightness
      );
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      ages[i] += 1 * speedFactor;

      if (ages[i] > lifetimes[i]) {
        ages[i] = 0;
        positions[i3] = 0;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = 0;

        // Use lifetimeRange if available, otherwise fall back to lifetime
        const minLife = config.lifetimeRange?.minLifetime ?? config.lifetime.min;
        const maxLife = config.lifetimeRange?.maxLifetime ?? config.lifetime.max;
        lifetimes[i] = minLife + Math.random() * (maxLife - minLife);

        velocities[i3] = (Math.random() - 0.5) * spread.x;
        velocities[i3 + 1] = Math.random() * spread.y + initialBoost;
        velocities[i3 + 2] = (Math.random() - 0.5) * spread.z;
      }

      positions[i3] += velocities[i3] * speedFactor;
      positions[i3 + 1] += velocities[i3 + 1] * speedFactor;
      positions[i3 + 2] += velocities[i3 + 2] * speedFactor;

      velocities[i3 + 1] -= gravity * speedFactor;

      if (turbulence > 0) {
        velocities[i3] += (Math.random() - 0.5) * turbulence * speedFactor;
        velocities[i3 + 1] += (Math.random() - 0.5) * turbulence * speedFactor;
        velocities[i3 + 2] += (Math.random() - 0.5) * turbulence * speedFactor;
      }

      const lifeRatio = 1 - ages[i] / lifetimes[i];
      
      if (colorRange?.enabled) {
        // Interpolate between start and end colors
        colorTHREE.copy(startColor).lerp(endColor, 1 - lifeRatio);
      } else {
        // Use base color with lifetime fade
        colorTHREE.setHSL(color.hue, color.saturation, color.lightness * lifeRatio);
      }

      colors[i3] = colorTHREE.r;
      colors[i3 + 1] = colorTHREE.g;
      colors[i3 + 2] = colorTHREE.b;
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
  };
}