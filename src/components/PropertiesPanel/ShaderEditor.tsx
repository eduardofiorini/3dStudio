import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { ShaderAsset } from '../../store/slices/shaderAssetsSlice';
import { cn } from '../../utils/cn';
import * as THREE from 'three';

interface ShaderEditorProps {
  shader: ShaderAsset;
  onClose: () => void;
}

type ShaderTab = 'vertex' | 'fragment';

export function ShaderEditor({ shader, onClose }: ShaderEditorProps) {
  const [activeTab, setActiveTab] = useState<ShaderTab>('vertex');
  const [vertexShader, setVertexShader] = useState(shader.vertexShader);
  const [fragmentShader, setFragmentShader] = useState(shader.fragmentShader);
  const [error, setError] = useState<string | null>(null);
  const updateShaderAsset = useEditorStore((state) => state.updateShaderAsset);

  const handleUpdate = () => {
    try {
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        uniforms: {
          time: { value: 0 },
          resolution: { value: new THREE.Vector2() }
        }
      });

      shader.users.forEach(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.material = material.clone();
          obj.material.needsUpdate = true;
        }
      });

      updateShaderAsset(shader.id, {
        vertexShader,
        fragmentShader,
        material
      });

      useEditorStore.getState().updateTransform();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Update Button */}
      <button
        onClick={handleUpdate}
        className={cn(
          "w-full py-1.5 rounded text-sm transition-colors",
          "bg-blue-500 hover:bg-blue-600 text-white"
        )}
      >
        Update Shader
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Shader Tabs */}
      <div className="flex border-b border-gray-700/50">
        <button
          onClick={() => setActiveTab('vertex')}
          className={cn(
            "px-4 py-2 text-xs font-medium transition-colors",
            activeTab === 'vertex'
              ? "text-blue-400 border-b-2 border-blue-400 -mb-px"
              : "text-gray-400 hover:text-gray-300"
          )}
        >
          Vertex
        </button>
        <button
          onClick={() => setActiveTab('fragment')}
          className={cn(
            "px-4 py-2 text-xs font-medium transition-colors",
            activeTab === 'fragment'
              ? "text-blue-400 border-b-2 border-blue-400 -mb-px"
              : "text-gray-400 hover:text-gray-300"
          )}
        >
          Fragment
        </button>
      </div>

      {/* Shader Content */}
      <div className="relative">
        {activeTab === 'vertex' ? (
          <textarea 
            value={vertexShader}
            onChange={(e) => setVertexShader(e.target.value)}
            className={cn(
              "w-full h-[250px] p-3 font-mono text-xs",
              "bg-[#1e1e1e] text-gray-300 rounded border border-gray-700/50",
              "focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            )}
            spellCheck={false}
          />
        ) : (
          <textarea 
            value={fragmentShader}
            onChange={(e) => setFragmentShader(e.target.value)}
            className={cn(
              "w-full h-[250px] p-3 font-mono text-xs",
              "bg-[#1e1e1e] text-gray-300 rounded border border-gray-700/50",
              "focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            )}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}