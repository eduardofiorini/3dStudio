import { useEditorStore } from '../../store/editorStore';

export function SplatSettings() {
  const selectedObject = useEditorStore((state) => state.selectedObject);

  if (!selectedObject?.userData.isGaussianSplat) return null;

  return (
    <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-200">
      <p>⚠️ Splat customization options coming soon! The current version focuses on stable rendering and performance.</p>
    </div>
  );
}