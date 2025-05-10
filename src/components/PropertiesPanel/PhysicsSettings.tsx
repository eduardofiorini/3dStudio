import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { cn } from '../../utils/cn';

const physicsTypeOptions = [
  { value: 'dynamic', label: 'Dynamic' },
  { value: 'static', label: 'Static' },
  { value: 'kinematic', label: 'Kinematic' }
];

import { storeInitialTransform } from '../../utils/physics/transforms';

export default function PhysicsSettings() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const updateTransform = useEditorStore((state) => state.updateTransform);

  if (!selectedObject) return null;

  // Check if object type is supported for physics
  // Check if object is a GLB model, group, or media object
  const isGLBModel = selectedObject.userData.isGLBModel || 
                     selectedObject.type === 'Group' ||
                     selectedObject.children?.some(child => child.userData?.isGLBModel);
  const isMediaObject = selectedObject.userData.mediaType;
  const isLight = selectedObject.userData.isLight;
  const isUnsupportedType = isGLBModel || isMediaObject || isLight;

  if (isUnsupportedType) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-2 text-yellow-200/90 text-xs">
        <p>⚠️ Physics is not available for {
          isLight ? 'lights' : 
          isGLBModel ? 'GLB models' : 
          'media objects'
        }. Only primitive shapes and text objects support physics.</p>
      </div>
    );
  }


  // Check if the object has physics enabled
  const isPhysicsEnabled = selectedObject.userData.physicsEnabled || false;
  const physicsType = selectedObject.userData.physicsType || 'dynamic';

  const handlePhysicsToggle = (enabled: boolean) => {
    if (!selectedObject) return;

    // When enabling physics, store current transform as initial transform
    if (enabled) {
      // Always store current transform when enabling physics
      selectedObject.userData.initialTransform = {
        position: selectedObject.position.clone(),
        rotation: selectedObject.rotation.clone(),
        scale: selectedObject.scale.clone()
      };


      selectedObject.userData.physicsEnabled = true;
      selectedObject.userData.physicsType = selectedObject.userData.physicsType || 'dynamic';
    } else {
      // When disabling physics, keep current transform but clear physics state
      selectedObject.userData.physicsEnabled = false;
      delete selectedObject.userData.physicsType;
      delete selectedObject.userData.rigidBody;
      
      // Store current transform as new initial transform
      selectedObject.userData.initialTransform = {
        position: selectedObject.position.clone(),
        rotation: selectedObject.rotation.clone(),
        scale: selectedObject.scale.clone()
      };
    }

    updateTransform();
  };

  const handlePhysicsTypeChange = (type: string) => {
    if (!selectedObject) return;
    selectedObject.userData.physicsType = type;
    updateTransform();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPhysicsEnabled}
            onChange={(e) => handlePhysicsToggle(e.target.checked)}
            className={cn(
              "rounded border-gray-700",
              "focus:ring-2 focus:ring-blue-500/50",
              "checked:bg-blue-500 checked:border-blue-600"
            )}
          />
          <span className="text-xs text-gray-400">Enable Physics</span>
        </label>
      </div>

      {isPhysicsEnabled && <div>
        <label className="text-xs text-gray-400 block mb-2">Physics Type</label>
        <select
          value={physicsType}
          onChange={(e) => handlePhysicsTypeChange(e.target.value)}
          className={cn(
            "w-full py-1.5 px-2 bg-gray-800/50 border border-gray-700/50 rounded text-xs text-gray-200",
            "focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          )}
        >
          {physicsTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {physicsType === 'static' && (
          <p className="mt-2 text-xs text-gray-500 italic">
            Static objects are immovable and act as collision surfaces
          </p>
        )}
      </div>}
    </div>
  );
}