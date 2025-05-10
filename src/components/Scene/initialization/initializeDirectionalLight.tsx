import { SceneSettings } from '../../../types/editor';

export function initializeDirectionalLight(settings: SceneSettings) {
  return (
    <directionalLight 
      position={[
        settings.directionalLightPosition.x,
        settings.directionalLightPosition.y,
        settings.directionalLightPosition.z
      ]} 
      intensity={settings.directionalLightIntensity}
      color={settings.directionalLightColor}
      castShadow
      shadow-radius={settings.shadowRadius * 2}
      shadow-bias={settings.shadowBias}
      shadow-mapSize={[4096, 4096]}
      shadow-camera-left={-15}
      shadow-camera-right={15}
      shadow-camera-top={15}
      shadow-camera-bottom={-15} 
      shadow-camera-near={1}
      shadow-camera-far={50}
      shadow-normalBias={0.02}
      shadow-intensity={settings.shadowIntensity}
    />
  );
}