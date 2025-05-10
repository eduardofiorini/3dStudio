// createParticleDust.ts

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
 * Creates a "dust" Points object spreading throughout a larger area,
 * gently drifting with minimal gravity/turbulence.
 */
export function createParticleDust() {
  const fountainConfig: FountainConfig = {
    count: 1200,
    size: 0.07,
    opacity: 0.5,

    // Very slight gravity => floating dust
    gravity: 0.00005,
    turbulence: 0.001,
    spread: { x: 0.3, y: 0.1, z: 0.3 },
    initialBoost: 0.0,

    // Medium lifetimes
    lifetime: { min: 150, max: 300 },

    // Dusty brown-ish color
    color: { hue: 0.1, saturation: 0.3, lightness: 0.4 },
    colorRange: {
      enabled: true,
      start: { hue: 0.1, saturation: 0.3, lightness: 0.6 },
      end: { hue: 0.1, saturation: 0.15, lightness: 0.3 },
    },

    blendingMode: 'Normal',

    // Possibly textured dust or just plain points
    style: 'textured',

    // Slows/speeds the entire effect
    speedFactor: 0.02,
  };

  let material: THREE.PointsMaterial;

  if (fountainConfig.style === 'textured') {
    // Create a simple circular "dust" texture via canvas
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

    const dustTexture = new THREE.CanvasTexture(canvas);

    material = new THREE.PointsMaterial({
      size: fountainConfig.size,
      map: dustTexture,
      vertexColors: true,
      blending: THREE.NormalBlending,
      transparent: true,
      opacity: fountainConfig.opacity,
      depthWrite: false,
    });
  } else {
    // Fallback: simple points
    material = new THREE.PointsMaterial({
      size: fountainConfig.size * 0.5,
      vertexColors: true,
      blending: THREE.NormalBlending,
      transparent: true,
      opacity: fountainConfig.opacity,
      depthWrite: false,
    });
  }

  const geometry = new THREE.BufferGeometry();
  const particles = new THREE.Points(geometry, material);

  particles.userData.objectType = 'Particles';
  particles.userData.fountainConfig = fountainConfig;

  // Initialize arrays
  initializeDustParticles(particles, fountainConfig);

  // Attach animation function
  particles.userData.animate = createAnimationFunction(particles);

  return particles;
}

/**
 * Sets up the initial positions, velocities, lifetimes, etc. for "dust"
 * (no rotation/scale arrays).
 */
function initializeDustParticles(particles: THREE.Points, config: FountainConfig) {
  const { count, spread, initialBoost, lifetime, color, colorRange } = config;

  const positions  = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const lifetimes  = new Float32Array(count);
  const ages       = new Float32Array(count);
  const colors     = new Float32Array(count * 3);

  
  // Dispose of existing geometry and create new one
  if (particles.geometry) particles.geometry.dispose();
  particles.geometry = new THREE.BufferGeometry();

  const colorTHREE = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Spread dust in a fairly large region
    positions[i3]     = (Math.random() - 0.5) * 40;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 40;

    // Light random velocities
    velocities[i3]     = (Math.random() - 0.5) * spread.x;
    velocities[i3 + 1] = (Math.random() - 0.5) * spread.y + initialBoost;
    velocities[i3 + 2] = (Math.random() - 0.5) * spread.z;

    // Random lifetime & age
    const life = lifetime.min + Math.random() * (lifetime.max - lifetime.min);
    lifetimes[i] = life;
    ages[i]      = Math.random() * life;

    // Color from the "start" color range if enabled
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

  // Assign typed arrays to geometry
  particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Store references in userData for animation
  particles.userData.particles = {
    positions,
    velocities,
    lifetimes,
    ages,
    colors,
  } as ParticleData;
}

/**
 * Animation function for dust: no rotation/scale => simpler logic
 */
function createAnimationFunction(particles: THREE.Points) {
  return function animate() {
    const config = particles.userData.fountainConfig as FountainConfig;
    const {
      count,
      gravity,
      spread,
      turbulence,
      initialBoost,
      color,
      colorRange,
      speedFactor = 1,
    } = config;

    const { positions, velocities, lifetimes, ages, colors } =
      particles.userData.particles as ParticleData;

    const colorTHREE = new THREE.Color();
    const startColor = new THREE.Color();
    const endColor   = new THREE.Color();

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

      // Age increases by speedFactor
      ages[i] += 1 * speedFactor;

      // If lifetime exceeded, reset particle
      if (ages[i] > lifetimes[i]) {
        ages[i] = 0;

        // Re-randomize position in the wide area
        positions[i3]     = (Math.random() - 0.5) * 40;
        positions[i3 + 1] = (Math.random() - 0.5) * 10;
        positions[i3 + 2] = (Math.random() - 0.5) * 40;

        // New velocity
        velocities[i3]     = (Math.random() - 0.5) * spread.x;
        velocities[i3 + 1] = (Math.random() - 0.5) * spread.y + initialBoost;
        velocities[i3 + 2] = (Math.random() - 0.5) * spread.z;

        // New lifetime
        lifetimes[i] =
          config.lifetime.min +
          Math.random() * (config.lifetime.max - config.lifetime.min);
      }

      // Move dust => velocity * speedFactor
      positions[i3]     += velocities[i3]     * speedFactor;
      positions[i3 + 1] += velocities[i3 + 1] * speedFactor;
      positions[i3 + 2] += velocities[i3 + 2] * speedFactor;

      // Slight gravity => near-zero => floating
      velocities[i3 + 1] -= gravity * speedFactor;

      // Subtle turbulence => also scaled by speedFactor
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

      // Optionally fade color near the end
      const fadeAlpha = lifeRatio;
      colors[i3]     = colorTHREE.r * fadeAlpha;
      colors[i3 + 1] = colorTHREE.g * fadeAlpha;
      colors[i3 + 2] = colorTHREE.b * fadeAlpha;
    }

    // Mark geometry for update
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
  };
}
