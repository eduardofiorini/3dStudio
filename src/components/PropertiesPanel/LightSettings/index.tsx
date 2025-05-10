import { useEditorStore } from '../../../store/editorStore';
import { PointLight, DirectionalLight, AmbientLight, RectAreaLight } from 'three';
import { ColorControl } from './ColorControl';
import { IntensityControl } from './IntensityControl';
import { ShadowControls } from './ShadowControls';
import { PointLightControls } from './PointLightControls';
import { RectAreaLightControls } from './RectAreaLightControls';

export function LightSettings() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  
  if (!selectedObject?.userData.isLight) return null;
  
  const light = selectedObject;
  const isPointLight = light instanceof PointLight;
  const isDirectionalLight = light instanceof DirectionalLight;
  const isRectAreaLight = light instanceof RectAreaLight;

  const updateHelperColor = (color: string) => {
    const sphere = light.children[0];
    if (sphere?.material) {
      sphere.material.color.set(color);
    }
  };

  return (
    <div className="space-y-4">
      {/* Show transform controls for RectArea lights */}
      {isRectAreaLight && (
        <div className="space-y-4">
          <TransformGroup
            title="Location"
            values={{
              x: light.position.x,
              y: light.position.y,
              z: light.position.z
            }}
            onChange={(axis, value) => updateObjectTransform(light, 'position', axis, value)}
            step={0.1}
          />

          <TransformGroup
            title="Rotation"
            values={{
              x: light.rotation.x * (180 / Math.PI),
              y: light.rotation.y * (180 / Math.PI),
              z: light.rotation.z * (180 / Math.PI)
            }}
            onChange={(axis, value) => updateObjectTransform(light, 'rotation', axis, value)}
            step={15}
          />
        </div>
      )}

      <ColorControl 
        color={light.color} 
        onUpdateHelper={updateHelperColor}
      />

      <IntensityControl 
        intensity={light.intensity}
        onChange={(value) => light.intensity = value}
        max={isPointLight ? 100 : 10}
      />

      {isPointLight && (
        <PointLightControls light={light} />
      )}

      {(isPointLight || isDirectionalLight) && (
        <ShadowControls 
          light={light} 
          isDirectionalLight={isDirectionalLight}
        />
      )}
      
      {isRectAreaLight && (
        <RectAreaLightControls light={light} />
      )}
    </div>
  );
}