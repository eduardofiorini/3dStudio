import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { ObjectOptions, setupBaseObject } from './baseObject';
import { SpotLightHelper } from 'three';

export interface LightOptions extends ObjectOptions {
  color?: string;
  intensity?: number;
  distance?: number;
  decay?: number;
  width?: number;
  height?: number;
  angle?: number;
  penumbra?: number;
}

// Initialize RectAreaLight uniforms
RectAreaLightUniformsLib.init();

export function createDirectionalLight(options: LightOptions = {}) {
  const {
    color = '#ffffff',
    intensity = 6,
    position = { x: 8, y: 10, z: -4 }
  } = options;

  const light = new THREE.DirectionalLight(color, intensity);
  
  // Setup shadows with good defaults
  light.castShadow = true;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 100;
  light.shadow.camera.left = -15;
  light.shadow.camera.right = 15;
  light.shadow.camera.top = 15;
  light.shadow.camera.bottom = -15;
  light.shadow.mapSize.set(2048, 2048);  // Reduced for better performance
  light.shadow.bias = 0;
  light.shadow.normalBias = 0.045;
  light.shadow.radius = 6.0;
  light.shadow.blurSamples = 4;  // Reduced blur samples
  
  // Set user data for identification
  light.userData.objectType = 'Directional Light';
  light.userData.isLight = true;
  
  return setupBaseObject(light, { position, ...options });
}

export function createAmbientLight(options: LightOptions = {}) {
  const {
    color = '#ffffff',
    intensity = 1.2
  } = options;

  const light = new THREE.AmbientLight(color, intensity);
  
  // Set user data for identification
  light.userData.objectType = 'Ambient Light';
  light.userData.isLight = true;
  
  return setupBaseObject(light, options);
}

export function createPointLight(options: LightOptions = {}) {
  const {
    color = '#ffffff',
    intensity = 100.0,
    distance = 30.0,
    decay = 2.0,
    position = { x: 0, y: 2, z: 0 }
  } = options;

  // Create the point light
  const light = new THREE.PointLight(color, intensity, distance, decay);
  
  // Setup shadows with good defaults
  light.castShadow = true;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 30;
  light.shadow.bias = -0.0030;
  light.shadow.normalBias = 0.000;
  
  // Add a small sphere to make the light visible
  const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 8);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.castShadow = false;
  sphere.receiveShadow = false;
  light.add(sphere);

  // Set user data for identification
  light.userData.objectType = 'Point Light';
  light.userData.isLight = true;
  
  return setupBaseObject(light, { position, ...options });
}

export function createRectAreaLight(options: LightOptions = {}) {
  const {
    color = '#ffffff',
    intensity = 5,
    width = 4.0,
    height = 4.0,
    position = { x: 0, y: 0, z: 0 }
  } = options;

  const light = new THREE.RectAreaLight(color, intensity, width, height);
  
  // Create helper to visualize the light
  // Store helper constructor on light's userData for later use
  light.userData.RectAreaLightHelper = RectAreaLightHelper;
  const helper = new RectAreaLightHelper(light);
  helper.name = 'RectAreaLightHelper';
  light.add(helper);

  // Set user data for identification
  light.userData.objectType = 'Rect Area Light';
  light.userData.isLight = true;
  
  return setupBaseObject(light, { position, ...options });
}

export function createSpotLight(options: LightOptions = {}) {
  const {
    color = '#ffffff',
    intensity = 50,
    distance = 10,
    angle = (30 * Math.PI) / 180, // 30 degrees in radians
    penumbra = 0.1,
    decay = 1.0,
    position = { x: 0, y: 5, z: 0 }
  } = options;

  const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
  
  // Setup shadows with good defaults
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 30;
  light.shadow.camera.fov = 30;
  light.shadow.bias = -0.0030;
  light.shadow.normalBias = 0.000;
  
  // Add target as child of light to move with it
  light.add(light.target);
  light.target.position.set(0, -1, 0); // Point slightly downward by default
  
  // Add a small sphere to make the light visible
  const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 8);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.castShadow = false;
  sphere.receiveShadow = false;
  light.add(sphere);

  // Add helper to visualize the light
  const helper = new SpotLightHelper(light);
  helper.visible = true;
  helper.name = 'SpotLightHelper';
  light.add(helper);
  
  // Store helper update function in userData
  light.userData.updateHelper = () => {
    const helper = light.children.find(child => child.name === 'SpotLightHelper');
    if (helper instanceof SpotLightHelper) {
      helper.matrix.copy(light.matrix);
      helper.update();
    }
  };

  // Set user data for identification
  light.userData.objectType = 'Spot Light';
  light.userData.isLight = true;
  
  return setupBaseObject(light, { position, ...options });
}