import * as THREE from 'three';

export interface FountainConfig {
  count: number;
  size: number;
  opacity: number;
  gravity: number;
  turbulence?: number;
  spread: {
    x: number;
    y: number;
    z: number;
  };
  initialBoost: number;
  lifetime: {
    min: number;
    max: number;
  };
  color: {
    hue: number;
    saturation: number;
    lightness: number;
  };
}

interface ParticleData {
  positions: Float32Array;
  velocities: Float32Array;
  lifetimes: Float32Array;
  ages: Float32Array;
  colors: Float32Array;
}

/**
 * Create a particle fountain (THREE.Points).
 */
export function createParticleFountain() {
  const fountainConfig: FountainConfig = {
    count: 1000,
    size: 0.1,
    opacity: 0.8,
    gravity: 0.003,
    spread: { x: 0.15, y: 0.15, z: 0.15 },
    initialBoost: 0.05,
    lifetime: { min: 70, max: 120 },
    color: { hue: 0.6, saturation: 0.8, lightness: 0.5 },
  };

  // Create geometry & material
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({
    size: fountainConfig.size,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: fountainConfig.opacity,
    depthWrite: false,
  });

  // Create Points object
  const particles = new THREE.Points(geometry, material);

  // Attach config/userData
  particles.userData.objectType = 'Particles';
  particles.userData.fountainConfig = fountainConfig;

  // Initialize particles
  initializeParticles(particles, fountainConfig);

  // Animation callback
  particles.userData.animate = createAnimationFunction(particles);

  return particles;
}

/**
 * Exported so other files (like ParticleSettings) can re-init with a new count.
 */
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

    // Set lifetime based on range or default
    const minLife = config.lifetimeRange?.minLifetime ?? lifetime.min;
    const maxLife = config.lifetimeRange?.maxLifetime ?? lifetime.max;
    const life = minLife + Math.random() * (maxLife - minLife);
    lifetimes[i] = life;
    ages[i] = Math.random() * life; // Random initial age based on particle's lifetime

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

/**
 * Creates the animation function to update particle positions/colors each frame.
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
    } = config;

    const { positions, velocities, lifetimes, ages, colors } =
      particles.userData.particles as ParticleData;

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

      // Age
      ages[i] += 1;
      if (ages[i] > lifetimes[i]) {
        // Reset particle with new lifetime
        ages[i] = 0;
        positions[i3 + 0] = 0;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = 0;

        // Set new lifetime based on range or default
        const minLife = config.lifetimeRange?.minLifetime ?? config.lifetime.min;
        const maxLife = config.lifetimeRange?.maxLifetime ?? config.lifetime.max;
        lifetimes[i] = minLife + Math.random() * (maxLife - minLife);

        velocities[i3 + 0] = (Math.random() - 0.5) * spread.x;
        velocities[i3 + 1] = Math.random() * spread.y + initialBoost;
        velocities[i3 + 2] = (Math.random() - 0.5) * spread.z;
      }

      // Move
      positions[i3 + 0] += velocities[i3 + 0];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Gravity
      velocities[i3 + 1] -= gravity;

      // Apply turbulence if enabled
      if (turbulence > 0) {
        // Add random movement to each axis
        velocities[i3 + 0] += (Math.random() - 0.5) * turbulence;
        velocities[i3 + 1] += (Math.random() - 0.5) * turbulence;
        velocities[i3 + 2] += (Math.random() - 0.5) * turbulence;
      }

      // Color fade
      const lifeRatio = 1 - ages[i] / lifetimes[i];
      
      if (colorRange?.enabled) {
        // Lerp between start and end colors
        colorTHREE.copy(startColor).lerp(endColor, 1 - lifeRatio);
      } else {
        // Use base color with lifetime fade
        colorTHREE.setHSL(color.hue, color.saturation, color.lightness);
      }
      
      // Apply final color with opacity fade
      colors[i3 + 0] = colorTHREE.r;
      colors[i3 + 1] = colorTHREE.g;
      colors[i3 + 2] = colorTHREE.b;
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
  };
}
