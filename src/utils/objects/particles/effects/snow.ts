// createParticleSnow.ts

import * as THREE from 'three';
import { FountainConfig } from '../../particles/types';

/**
 * Internal type for storing all particle data
 */
interface ParticleData {
  positions: Float32Array;
  velocities: Float32Array;
  lifetimes: Float32Array;
  ages: Float32Array;
  colors: Float32Array;
}

/**
 * Main entry point to create the Snow particle effect.
 */
export function createParticleSnow() {
  const fountainConfig: FountainConfig = {
    count: 3000,
    size: 0.2,
    opacity: 0.9,
    gravity: 0.0002,         // gentle downward pull
    turbulence: 0.0003,      // subtle horizontal drifting
    spread: { x: 0.3, y: 0.01, z: 0.3 },
    initialBoost: 0.0,
    lifetime: { min: 300, max: 600 },
    color: { hue: 0.0, saturation: 0.0, lightness: 1.0 },
    colorRange: {
      enabled: true,
      start: { hue: 0.0, saturation: 0.0, lightness: 1.0 },
      end: { hue: 0.0, saturation: 0.0, lightness: 0.8 },
    },

    // NEW: speedFactor to slow/speed the entire motion
    // e.g., 0.02 => quite slow, 0.1 => moderate, 1 => original speed
    speedFactor: 0.35,
    style: 'textured'  // Set default style to textured
  };

  // Create geometry & material
  const geometry = new THREE.BufferGeometry();
  
  // Create snow texture using canvas
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
  
  const snowTexture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: fountainConfig.size,
    map: snowTexture,
    vertexColors: true,
    blending: THREE.NormalBlending,
    transparent: true,
    opacity: fountainConfig.opacity,
    depthWrite: false,
  });

  // Create the Points object
  const particles = new THREE.Points(geometry, material);
  particles.userData.objectType = 'Particles';
  particles.userData.fountainConfig = fountainConfig;

  // Initialize positions/velocities/lifetimes
  initializeSnowParticles(particles, fountainConfig);

  // Attach animation function
  particles.userData.animate = createAnimationFunction(particles);

  return particles;
}

/**
 * Initializes snow across a wide region in the sky.
 * For example:
 *   x,z in [-10..10], y in [5..10] (or bigger if you want)
 */
function initializeSnowParticles(particles: THREE.Points, config: FountainConfig) {
  const { count, lifetime, color, colorRange } = config;

  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const lifetimes = new Float32Array(count);
  const ages = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const colorTHREE = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Spread the flakes in a ~20x20 region horizontally, Y from 5..10
    positions[i3]     = (Math.random() - 0.5) * 20; // x:  -10..10
    positions[i3 + 1] = 5 + Math.random() * 5;      // y:   5..10
    positions[i3 + 2] = (Math.random() - 0.5) * 20; // z:  -10..10

    // Slow random velocities
    velocities[i3]     = (Math.random() - 0.5) * 0.01; // gentle horizontal
    velocities[i3 + 1] = -Math.random() * 0.01;        // drifting downward
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.01; // gentle horizontal

    // Lifetimes
    const life = lifetime.min + Math.random() * (lifetime.max - lifetime.min);
    lifetimes[i] = life;
    // Randomly start anywhere in that lifetime
    ages[i] = Math.random() * life;

    // If color range is enabled, start with the "start color"
    if (colorRange?.enabled) {
      colorTHREE.setHSL(
        colorRange.start.hue,
        colorRange.start.saturation,
        colorRange.start.lightness
      );
    } else {
      colorTHREE.setHSL(color.hue, color.saturation, color.lightness);
    }

    colors[i3]     = colorTHREE.r;
    colors[i3 + 1] = colorTHREE.g;
    colors[i3 + 2] = colorTHREE.b;
  }

  // Attach to geometry
  particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Store for the animation loop
  particles.userData.particles = {
    positions,
    velocities,
    lifetimes,
    ages,
    colors,
  } as ParticleData;
}

/**
 * The animation function:
 * - Moves snow downward (multiplied by speedFactor)
 * - Adds subtle turbulence
 * - Respawns flakes at top if they "die"
 * - Optionally interpolates color
 */
function createAnimationFunction(particles: THREE.Points) {
  return function animate() {
    const config = particles.userData.fountainConfig as FountainConfig;
    const {
      count,
      gravity,
      spread,
      turbulence = 0,
      initialBoost,
      color,
      colorRange,
      speedFactor = 1, // default 1 if not provided
    } = config;

    const { positions, velocities, lifetimes, ages, colors } =
      particles.userData.particles as ParticleData;

    const colorTHREE = new THREE.Color();
    const startColor = new THREE.Color();
    const endColor = new THREE.Color();

    // Prepare color range
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

      // Increase ages by speedFactor
      ages[i] += 1 * speedFactor;

      // Respawn if lifetime exceeded
      if (ages[i] > lifetimes[i]) {
        ages[i] = 0;

        // Reposition near top
        positions[i3]     = (Math.random() - 0.5) * 20;
        positions[i3 + 1] = 5 + Math.random() * 5;
        positions[i3 + 2] = (Math.random() - 0.5) * 20;

        // New lifetime
        lifetimes[i] =
          config.lifetime.min + Math.random() * (config.lifetime.max - config.lifetime.min);

        // New velocity
        velocities[i3]     = (Math.random() - 0.5) * spread.x;
        velocities[i3 + 1] = Math.random() * spread.y + initialBoost; 
        velocities[i3 + 2] = (Math.random() - 0.5) * spread.z;
      }

      // Move positions by velocity * speedFactor
      positions[i3]     += velocities[i3]     * speedFactor;
      positions[i3 + 1] += velocities[i3 + 1] * speedFactor;
      positions[i3 + 2] += velocities[i3 + 2] * speedFactor;

      // Gravity => slow downward (scaled by speedFactor)
      velocities[i3 + 1] -= gravity * speedFactor;

      // Turbulence => subtle horizontal wandering (scaled by speedFactor)
      if (turbulence > 0) {
        velocities[i3]     += (Math.random() - 0.5) * turbulence * speedFactor;
        velocities[i3 + 1] += (Math.random() - 0.5) * turbulence * speedFactor;
        velocities[i3 + 2] += (Math.random() - 0.5) * turbulence * speedFactor;
      }

      // Color fade if using colorRange
      const lifeRatio = 1 - ages[i] / lifetimes[i];
      if (colorRange?.enabled) {
        colorTHREE.copy(startColor).lerp(endColor, 1 - lifeRatio);
      } else {
        colorTHREE.setHSL(color.hue, color.saturation, color.lightness);
      }

      colors[i3]     = colorTHREE.r;
      colors[i3 + 1] = colorTHREE.g;
      colors[i3 + 2] = colorTHREE.b;
    }

    // Mark geometry attributes as needing update
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
  };
}
