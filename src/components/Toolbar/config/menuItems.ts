import { Box, Type, Image, Grid, Upload, Lightbulb } from 'lucide-react';

export const menuItems = [
  {
    id: 'shapes',
    icon: Box,
    label: 'Shape',
    items: [
      { id: 'cube', label: 'Cube', icon: Box, action: 'createCube' },
      { id: 'sphere', label: 'Sphere', icon: 'Circle', action: 'createSphere' },
      { id: 'cylinder', label: 'Cylinder', icon: 'Cylinder', action: 'createCylinder' },
      { id: 'cone', label: 'Cone', icon: 'Cone', action: 'createCone' },
      { id: 'torus', label: 'Torus', icon: 'Circle', action: 'createTorus' },
      { id: 'plane', label: 'Plane', icon: 'Square', action: 'createPlane' },
      { id: 'empty', label: 'Empty', icon: 'Scan', action: 'createEmptyEntity' }
    ]
  },
  {
    id: 'media',
    icon: Image,
    label: 'Media',
    items: [
      { id: 'photo', label: 'Photo', icon: Image },
      { id: 'video', label: 'Video', icon: 'Film' }
    ]
  },
  {
    id: 'text',
    icon: Type,
    label: 'Text',
    items: [
      { id: '3d-text', label: '3D Text', icon: Box, is3D: true },
      { id: '2d-text', label: '2D Text', icon: Type, is3D: false }
    ]
  },
  {
    id: 'lights',
    icon: Lightbulb,
    label: 'Light',
    items: [
      { id: 'directional', label: 'Directional Light', action: 'createDirectionalLight' },
      { id: 'ambient', label: 'Ambient Light', action: 'createAmbientLight' },
      { id: 'point', label: 'Point Light', action: 'createPointLight' },
      { id: 'rect-area', label: 'Rect Area Light', action: 'createRectAreaLight' }
    ]
  },
  {
    id: 'array',
    icon: Grid,
    label: 'Array',
    isButton: true
  },
  {
    id: 'glb',
    icon: Upload,
    label: 'GLB',
    isButton: true
  }
] as const;