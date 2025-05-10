import { EffectComposer, Bloom, DepthOfField, Noise, Vignette, SMAA, BrightnessContrast, Pixelation } from '@react-three/postprocessing';
import { useEditorStore } from '../../store/editorStore';
import { BlendFunction } from 'postprocessing';

export function PostProcessing() {
  const sceneSettings = useEditorStore((state) => state.sceneSettings);
  const postProcessing = sceneSettings.postProcessing;

  return (
    <EffectComposer multisampling={8}>
      <SMAA />
      <BrightnessContrast
        brightness={postProcessing?.brightness ?? 0}
        contrast={postProcessing?.contrast ?? 0}
      />
      {postProcessing?.pixelation && (
        <Pixelation
          granularity={postProcessing.pixelSize}
        />
      )}
      {postProcessing?.bloom && (
        <Bloom 
          intensity={postProcessing.bloomIntensity}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      )}
      {postProcessing?.depthOfField && (
        <DepthOfField 
          focusDistance={0}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
      )}
      {postProcessing?.noise && (
        <Noise 
          opacity={0.015}
          blendFunction={BlendFunction.MULTIPLY}
        />
      )}
      {postProcessing?.vignette && (
        <Vignette
          offset={0.5}
          darkness={postProcessing.vignetteAmount ?? 0.5}
          eskil={false}
        />
      )}
    </EffectComposer>
  );
}