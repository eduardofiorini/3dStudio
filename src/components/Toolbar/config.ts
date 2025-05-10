import { Box, Circle, Cone, Square, Type, Image, Film, Grid, Upload, Cylinder, Scan } from 'lucide-react';

export const shapeButtons = [
  { icon: Box, label: 'Cube', action: 'createCube' },
  { icon: Circle, label: 'Sphere', action: 'createSphere' },
  { icon: Cylinder, label: 'Cylinder', action: 'createCylinder' },
  { icon: Cone, label: 'Cone', action: 'createCone' },
  { icon: Circle, label: 'Torus', action: 'createTorus' },
  { icon: Square, label: 'Plane', action: 'createPlane' },
  { icon: Scan, label: 'Empty', action: 'createEmptyEntity' },
];

export const mediaButtons = [
  { icon: Image, label: 'Photo', type: 'image' },
  { icon: Film, label: 'Video', type: 'video' },
];

export const textButtons = [
  { icon: Box, label: '3D Text', is3D: true },
  { icon: Type, label: '2D Text', is3D: false },
];