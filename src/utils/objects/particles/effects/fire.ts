// createParticleFire.ts

import * as THREE from 'three';
import { FountainConfig } from '../../particles/types';

interface ParticleData {
  positions: Float32Array;
  velocities: Float32Array;
  lifetimes: Float32Array;
  ages: Float32Array;
  colors: Float32Array;
}

/**
 * Creates a "fire" Points object with slowly rising, flickering particles.
 * Has a speedFactor to slow/speed the entire animation.
 */
export function createParticleFire() {
  const fountainConfig: FountainConfig = {
    count: 1500,
    size: 0.25,
    opacity: 1.0,

    // Gravity is negative => particles gently move upward
    gravity: -0.00001,
    turbulence: 0.01,
    spread: { x: 0.05, y: 0.1, z: 0.05 },
    initialBoost: 0.001,
    
    // Particles last 30-50 frames of "age" (multiplied by speedFactor below)
    lifetime: { min: 30, max: 50 },

    // Color is set via HSL; warm fire-like hue
    color: { hue: 0.07, saturation: 1.0, lightness: 0.5 },
    colorRange: {
      enabled: true,
      start: { hue: 0.083, saturation: 1.0, lightness: 0.5 }, // #ffb800
      end: { hue: 0.0, saturation: 1.0, lightness: 0.5 }, // Pure red
    },

    // NEW: Add a speedFactor to control overall speed
    // e.g., 0.01 => very slow, 0.05 => moderate, 1 => original speed
    style: 'textured',  // Default to textured particles
    speedFactor: 0.15,
  };

  // Create geometry & material for Points
  const geometry = new THREE.BufferGeometry();
  
  // Create textured material for fire particles
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

  // Tag with metadata/config
  particles.userData.objectType = 'Particles';
  particles.userData.fountainConfig = fountainConfig;

  // Initialize arrays (position, velocity, etc.) and assign to geometry
  initializeFireParticles(particles, fountainConfig);

  // Attach the animation callback
  particles.userData.animate = createAnimationFunction(particles);

  return particles;
}

/**
 * Initializes the positions, velocities, and lifetimes for a "fire" effect:
 * - All start at (0,0,0)
 * - Small upward velocity + random spread
 */
function initializeFireParticles(particles: THREE.Points, config: FountainConfig) {
  const { count, spread, initialBoost, lifetime, color, colorRange } = config;

  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const lifetimes = new Float32Array(count);
  const ages = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const tmpColor = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Start at origin
    positions[i3 + 0] = 0;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = 0;

    // Random upward/spreading velocity
    velocities[i3 + 0] = (Math.random() - 0.5) * spread.x;
    velocities[i3 + 1] = Math.random() * spread.y + initialBoost;
    velocities[i3 + 2] = (Math.random() - 0.5) * spread.z;

    // Lifetime
    const life = lifetime.min + Math.random() * (lifetime.max - lifetime.min);
    lifetimes[i] = life;

    // Start age anywhere 0..life if you want a staggered effect
    ages[i] = Math.random() * life;

    // Assign initial color
    if (colorRange?.enabled) {
      tmpColor.setHSL(
        colorRange.start.hue,
        colorRange.start.saturation,
        colorRange.start.lightness
      );
    } else {
      tmpColor.setHSL(color.hue, color.saturation, color.lightness);
    }

    colors[i3 + 0] = tmpColor.r;
    colors[i3 + 1] = tmpColor.g;
    colors[i3 + 2] = tmpColor.b;
  }

  particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Store these arrays so we can update them each frame
  particles.userData.particles = {
    positions,
    velocities,
    lifetimes,
    ages,
    colors,
  } as ParticleData;
}

/**
 * createAnimationFunction:
 * Updates positions, velocities, color fade each frame.
 * Includes "speedFactor" to scale all motion & aging.
 */
function createAnimationFunction(particles: THREE.Points) {
  return function animate() {
    const config = particles.userData.fountainConfig as FountainConfig;
    const { count, gravity, spread, turbulence, initialBoost, color, colorRange, speedFactor = 1 } = config;

    const { positions, velocities, lifetimes, ages, colors } = 
      particles.userData.particles as ParticleData;

    const colorTHREE = new THREE.Color();
    const startColor = new THREE.Color();
    const endColor = new THREE.Color();

    // Precompute color range if enabled
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

      // Advance age by speedFactor
      ages[i] += speedFactor;

      // If lifetime exceeded, reset the particle
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

      // Update positions by velocity * speedFactor
      positions[i3]     += velocities[i3]     * speedFactor;
      positions[i3 + 1] += velocities[i3 + 1] * speedFactor;
      positions[i3 + 2] += velocities[i3 + 2] * speedFactor;

      // Negative gravity => gently rise
      velocities[i3 + 1] -= gravity * speedFactor;

      // Turbulence => random small shifts in velocity
      if (turbulence && turbulence > 0) {
        velocities[i3]     += (Math.random() - 0.5) * turbulence * speedFactor;
        velocities[i3 + 1] += (Math.random() - 0.5) * turbulence * speedFactor;
        velocities[i3 + 2] += (Math.random() - 0.5) * turbulence * speedFactor;
      }

      // Color fade over lifetime
      const lifeRatio = 1 - ages[i] / lifetimes[i];
      if (colorRange?.enabled) {
        colorTHREE.copy(startColor).lerp(endColor, 1 - lifeRatio);
      } else {
        colorTHREE.setHSL(color.hue, color.saturation, color.lightness);
      }

      colors[i3] = colorTHREE.r;
      colors[i3 + 1] = colorTHREE.g;
      colors[i3 + 2] = colorTHREE.b;
    }

    // Notify Three.js we changed these attributes
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
  };
}