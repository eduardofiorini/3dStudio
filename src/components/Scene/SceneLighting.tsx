import { useEditorStore } from '../../store/editorStore';
import { initializeDirectionalLight } from './initialization/initializeDirectionalLight';

export function SceneLighting() {
  const sceneSettings = useEditorStore((state) => state.sceneSettings);

  return (
    <>
      <ambientLight 
        intensity={sceneSettings.ambientLightIntensity} 
        color={sceneSettings.ambientLightColor} 
      />
      {initializeDirectionalLight(sceneSettings)}
    </>
  );
}