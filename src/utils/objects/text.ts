import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { ObjectOptions, setupBaseMesh } from './baseObject';
import { createStandardMaterial } from '../materials/standardMaterial';

export interface TextOptions extends ObjectOptions {
  text?: string;
  size?: number;
  height?: number;
  bevel?: {
    enabled: boolean;
    thickness?: number;
    size?: number;
    segments?: number;
  };
  is3D?: boolean;
  font?: string;
}

export const AVAILABLE_FONTS = {
  helvetiker: 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
  gentilis: 'https://threejs.org/examples/fonts/gentilis_regular.typeface.json',
  droid: 'https://threejs.org/examples/fonts/droid/droid_serif_regular.typeface.json',
  droid_sans: 'https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json'
} as const;

export async function createText(options: TextOptions = {}) {
  const {
    text = 'Text',
    size = 1,
    height = 0.2,
    bevel = { enabled: false, thickness: 0.02, size: 0.02, segments: 3 },
    is3D = true,
    font = AVAILABLE_FONTS.helvetiker,
    ...objectOptions
  } = options;

  // Create appropriate material based on type
  let material;
  if (objectOptions.material?.type === 'physical') {
    material = new THREE.MeshPhysicalMaterial({
      color: objectOptions.material.color || '#e0e0e0',
      emissive: new THREE.Color(objectOptions.material.emissive || '#000000'),
      emissiveIntensity: objectOptions.material.emissiveIntensity || 0,
      metalness: objectOptions.material.metalness || 0,
      roughness: objectOptions.material.roughness || 0.4,
      transmission: objectOptions.material.transmission || 0,
      thickness: objectOptions.material.thickness || 0,
      ior: objectOptions.material.ior || 1.5,
      transparent: objectOptions.material.transparent || false,
      opacity: objectOptions.material.opacity || 1
    });
  } else if (objectOptions.material?.type === 'hider') {
    material = new THREE.MeshStandardMaterial({
      colorWrite: false,
      side: THREE.DoubleSide,
      transparent: false,
      depthWrite: true,
      depthTest: true
    });
  } else {
    material = createStandardMaterial({
      color: objectOptions.material?.color || '#e0e0e0',
      emissive: objectOptions.material?.emissive || '#000000',
      emissiveIntensity: objectOptions.material?.emissiveIntensity || 0,
      metalness: objectOptions.material?.metalness || 0,
      roughness: objectOptions.material?.roughness || 0.4,
      opacity: objectOptions.material?.opacity || 1,
      transparent: objectOptions.material?.transparent || false
    });
  }

  if (is3D) {
    // Create 3D text
    const loadedFont = await loadFont(font || AVAILABLE_FONTS.helvetiker);
    const geometry = new TextGeometry(text, {
      font: loadedFont,
      size,
      height,
      curveSegments: 16,
      bevelEnabled: bevel.enabled,
      bevelThickness: bevel.thickness,
      bevelSize: bevel.size,
      bevelSegments: bevel.segments
    });

    geometry.computeBoundingBox();
    const mesh = new THREE.Mesh(geometry, material);
    
    // Center the text geometry
    if (geometry.boundingBox) {
      const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      mesh.position.x = -width / 2;
    }

    mesh.userData.textOptions = { text, size, height, is3D, font, bevel };
    mesh.userData.objectType = is3D ? '3D Text' : '2D Text';
    return setupBaseMesh(mesh, {
      ...objectOptions,
      position: { y: 0.5, ...objectOptions.position }
    });
  } else {
    // Create flat text using canvas texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    const fontSize = 200; // Increased base size for better quality
    
    context.font = `${fontSize}px Arial`;
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    
    canvas.width = Math.ceil(textWidth);
    canvas.height = fontSize * 1.5;
    
    // Clear background
    context.fillStyle = 'transparent';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    context.fillStyle = '#ffffff';
    context.font = `${fontSize}px Arial`;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const geometry = new THREE.PlaneGeometry(size, size * (canvas.height / canvas.width));
    
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      color: material?.color || '#e0e0e0',
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, textMaterial);
    mesh.userData.textOptions = { text, size, is3D, font };
    mesh.userData.objectType = '2D Text';
    
    return setupBaseMesh(mesh, {
      ...objectOptions,
      position: { y: 1, ...objectOptions.position },
      material: textMaterial
    });
  }
}

async function loadFont(url: string): Promise<THREE.Font> {
  const loader = new FontLoader();
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}