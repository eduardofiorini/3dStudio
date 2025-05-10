import { Box, Circle, Cone, Square, Cylinder, Scan, Pill, Camera, Type } from 'lucide-react';
import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { createCube, createSphere, createCylinder, createCone, createTorus, createPlane, createEmptyEntity, createCapsule, createPerspectiveCamera, createText } from '../../../utils/objects';
import { ToolbarMenu } from '../ToolbarMenu';

const shapeIcons = {
  cube: <Box className="w-4 h-4" />,
  sphere: <div className="w-4 h-4 relative flex items-center justify-center">
    <Circle className="w-4 h-4 stroke-[2.5]" />
  </div>,
  cylinder: <div className="w-4 h-4 relative flex items-center justify-center">
    <Cylinder className="w-4 h-4 stroke-[2.5]" />
  </div>,
  cone: <Cone className="w-4 h-4" />,
  torus: <div className="w-4 h-4 relative">
    <Circle className="w-4 h-4 absolute inset-0" />
    <Circle className="w-2.5 h-2.5 absolute inset-0 m-auto" />
  </div>,
  plane: <Square className="w-4 h-4" />,
  empty: <div className="w-4 h-4 relative flex items-center justify-center">
    <Scan className="w-4 h-4 stroke-[2.5]" />
  </div>,
  capsule: <Pill className="w-4 h-4" />,
  camera: <Camera className="w-4 h-4" />,
  text2d: <Type className="w-4 h-4" />,
  text3d: <Box className="w-4 h-4" />
};

export function ShapeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const addObject = useEditorStore((state) => state.addObject);

  const handleCreateShape = (creator: () => THREE.Mesh) => {
    addObject(creator());
    setIsOpen(false);
  };

  return (
    <ToolbarMenu
      icon={Box}
      label="Entity"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      <div className="grid grid-cols-1 gap-0.5 min-w-[140px]">
        <button
          onClick={() => handleCreateShape(createCube)}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
        >
          {shapeIcons.cube}
          <span>Cube</span>
        </button>
        <button
          onClick={() => handleCreateShape(createSphere)}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
        >
          {shapeIcons.sphere}
          <span>Sphere</span>
        </button>
        <button
          onClick={() => handleCreateShape(createCylinder)}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
        >
          {shapeIcons.cylinder}
          <span>Cylinder</span>
        </button>
        <button
          onClick={() => handleCreateShape(createCone)}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
        >
          {shapeIcons.cone}
          <span>Cone</span>
        </button>
        <button
          onClick={() => handleCreateShape(createTorus)}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
        >
          {shapeIcons.torus}
          <span>Torus</span>
        </button>
        <button
          onClick={() => handleCreateShape(createPlane)}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
        >
          {shapeIcons.plane}
          <span>Plane</span>
        </button>
        <button
          onClick={() => handleCreateShape(createCapsule)}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
        >
          {shapeIcons.capsule}
          <span>Capsule</span>
        </button>
        <div className="h-px bg-gray-700/50 my-1" />
        <button
          onClick={() => handleCreateShape(createEmptyEntity)}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
        >
          {shapeIcons.empty}
          <span>Empty</span>
        </button>
        <div className="h-px bg-gray-700/50 my-1" />
        <button
          onClick={() => {
            createText({
              text: 'Text',
              size: 1,
              height: 0.2,
              is3D: true,
              material: {
                color: '#e0e0e0',
                metalness: 0,
                roughness: 0.4
              }
            }).then(textObject => {
              addObject(textObject);
              setIsOpen(false);
            });
          }}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
        >
          {shapeIcons.text3d}
          <span>3D Text</span>
        </button>
        <button
          onClick={() => {
            createText({
              text: 'Text',
              size: 1,
              height: 0.001,
              is3D: false,
              material: {
                color: '#e0e0e0',
                metalness: 0,
                roughness: 0.4
              }
            }).then(textObject => {
              addObject(textObject);
              setIsOpen(false);
            });
          }}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
        >
          {shapeIcons.text2d}
          <span>2D Text</span>
        </button>
      </div>
      <div className="h-px bg-gray-700/50 my-1" />
      <button
        onClick={() => {
          const camera = createPerspectiveCamera({
            position: { x: 0, y: 2, z: 4 },
            fov: 50,
            near: 0.2,
            far: 100,
            showHelper: true
          });
          addObject(camera);
          setIsOpen(false);
        }}
        className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
      >
        {shapeIcons.camera}
        <span>Camera</span>
      </button>
    </ToolbarMenu>
  );
}