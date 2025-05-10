import { useEditorStore } from '../../store/editorStore';
import { Camera } from 'lucide-react';
import { cn } from '../../utils/cn';
import { updateObjectTransform } from '../../utils/transformUtils';
import SceneSettings from './SceneSettings';
import TextSettings from './TextSettings';
import { MaterialControls } from './MaterialControls';
import PhysicsSettings from './PhysicsSettings';
import { TransformGroup } from './TransformGroup';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function PropertiesPanel() {
  const selectedObject = useEditorStore((state) => state.selectedObject);

  if (!selectedObject) {
    return (
      <div className="w-80 bg-gray-900 p-4 border-r border-gray-800">
        <p className="text-gray-400 text-center">No object selected</p>
      </div>
    );
  }

  const rotation = {
    x: selectedObject.rotation.x * (180 / Math.PI),
    y: selectedObject.rotation.y * (180 / Math.PI),
    z: selectedObject.rotation.z * (180 / Math.PI),
  };

  return (
    <div className="w-80 bg-gray-900 p-4 border-r border-gray-800 overflow-y-auto text-gray-200">
      <div className="flex items-center gap-2 p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-300">Properties</h2>
        </div>
      </div>
      
      <div className="space-y-6">
        <TransformGroup
          title="Position"
          values={selectedObject.position}
          onChange={(axis, value) => updateObjectTransform(selectedObject, 'position', axis, value)}
          step={0.1}
        />

        <TransformGroup
          title="Rotation (degrees)"
          values={rotation}
          onChange={(axis, value) => updateObjectTransform(selectedObject, 'rotation', axis, value)}
          step={15}
        />

        <TransformGroup
          title="Scale"
          values={selectedObject.scale}
          onChange={(axis, value) => updateObjectTransform(selectedObject, 'scale', axis, value)}
          step={0.1}
          min={0.1}
        />
      </div>
    </div>
  );
}