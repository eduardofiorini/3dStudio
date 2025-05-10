import * as THREE from 'three';
import { initializeParticles } from '../particles';

export function createParticleFire() {
  const fountainConfig = {
    count: 1500,
    size: 0.15,
    opacity: 1.0,
    gravity: 0.0005,
    turbulence: 0.01,
    spread: { x: 0.1, y: 0.2, z: 0.1 },
    initialBoost: 0.08,
    lifetime: { min: 20, max: 50 },
    color: { hue: 0.07, saturation: 1.0, lightness: 0.5 },
    colorRange: {
      enabled: true,
      start: { hue: 0.07, saturation: 1.0, lightness: 0.7 },
      end: { hue: 0.0, saturation: 1.0, lightness: 0.3 }
    }
  };

  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({
    size: fountainConfig.size,
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
    const config = particles.userData.fountainConfig;
    const { count, gravity, spread, turbulence = 0, initialBoost, color, colorRange } = config;
    const { positions, velocities, lifetimes, ages, colors } = particles.userData.particles;

    const colorTHREE = new THREE.Color();
    const startColor = new THREE.Color();
    const endColor = new THREE.Color();

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
      ages[i] += 1;
      if (ages[i] > lifetimes[i]) {
        ages[i] = 0;
        positions[i3] = 0;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = 0;

        // reset lifetime
        const minLife = config.lifetime?.min ?? 70;
        const maxLife = config.lifetime?.max ?? 120;
        lifetimes[i] = minLife + Math.random() * (maxLife - minLife);

        velocities[i3] = (Math.random() - 0.5) * spread.x;
        velocities[i3 + 1] = Math.random() * spread.y + initialBoost;
        velocities[i3 + 2] = (Math.random() - 0.5) * spread.z;
      }

      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      velocities[i3 + 1] -= gravity;

      if (turbulence > 0) {
        velocities[i3] += (Math.random() - 0.5) * turbulence;
        velocities[i3 + 1] += (Math.random() - 0.5) * turbulence;
        velocities[i3 + 2] += (Math.random() - 0.5) * turbulence;
      }

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

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
  };
}