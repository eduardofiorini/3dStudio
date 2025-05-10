import { useState } from 'react';
import { Plus, MoreVertical, X } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { cn } from '../../utils/cn';
import { DragEvent } from 'react';
import * as THREE from 'three';
import { ShaderEditor } from './ShaderEditor';
import { ShaderPreview } from './ShaderPreview';

const DEFAULT_VERTEX_SHADER = `
varying vec2 vUv;
uniform float time;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const DEFAULT_FRAGMENT_SHADER = `
varying vec2 vUv;
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = vUv;
  
  // Animated color based on time
  vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0,2,4));
  
  gl_FragColor = vec4(color, 1.0);
}`;

export function ShaderAssets() {
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingName, setEditingName] = useState<{id: string, name: string} | null>(null);
  const [editingShader, setEditingShader] = useState<ShaderAsset | null>(null);
  const shaders = useEditorStore((state) => state.shaderAssets);
  const addShaderAsset = useEditorStore((state) => state.addShaderAsset);
  const updateShaderAsset = useEditorStore((state) => state.updateShaderAsset);
  const removeShaderAsset = useEditorStore((state) => state.removeShaderAsset);
  const setDraggedShader = useEditorStore((state) => state.setDraggedShader);

  const createNewShader = () => {
    const material = new THREE.ShaderMaterial({
      vertexShader: DEFAULT_VERTEX_SHADER,
      fragmentShader: DEFAULT_FRAGMENT_SHADER,
      transparent: true,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2() }
      }
    });

    const existingNumbers = shaders
      .map(s => {
        const match = s.name.match(/Shader(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => !isNaN(n));

    const nextNumber = existingNumbers.length > 0 
      ? Math.max(...existingNumbers) + 1 
      : 1;

    const name = `Shader${nextNumber}`;

    addShaderAsset({
      id: crypto.randomUUID(),
      name,
      vertexShader: DEFAULT_VERTEX_SHADER,
      fragmentShader: DEFAULT_FRAGMENT_SHADER,
      material,
      users: new Set()
    });
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, asset: ShaderAsset) => {
    e.dataTransfer.setData('application/shader', asset.id);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedShader(asset);
  };

  const handleDragEnd = () => {
    setDraggedShader(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 italic">
        Drag shader to scene hierarchy to apply
      </p>
      
      <div className="space-y-4">
        {shaders.map((asset) => (
          <div key={asset.id} className="space-y-2">
            <div 
              className={cn(
                "flex items-center gap-3 p-3 rounded border transition-colors cursor-pointer",
                "bg-gray-800/40 border-gray-700/50",
                "hover:bg-gray-700/40 hover:border-gray-600/50",
                editingShader?.id === asset.id && "border-blue-500/50"
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, asset)}
              onDragEnd={handleDragEnd}
              onClick={() => setEditingShader(editingShader?.id === asset.id ? null : asset)} 
            >
              {/* Shader Preview */}
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-black">
                <ShaderPreview 
                  size={48}
                  vertexShader={asset.vertexShader}
                  fragmentShader={asset.fragmentShader}
                />
              </div>

              <div className="flex-1 min-w-0">
                {editingName?.id === asset.id ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingName.name.trim()) {
                        updateShaderAsset(asset.id, { name: editingName.name.trim() });
                      }
                      setEditingName(null);
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editingName.name}
                      onChange={e => setEditingName({ id: asset.id, name: e.target.value })}
                      onBlur={() => setEditingName(null)}
                      autoFocus
                      className="bg-gray-800/50 px-2 py-0.5 rounded border border-gray-600/50 text-gray-200 text-sm w-full"
                    />
                  </form>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-gray-200">{asset.name}</span>
                    {asset.users.size > 0 && (
                      <span className="text-xs text-gray-500 block">
                        {asset.users.size} {asset.users.size === 1 ? 'use' : 'uses'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowMenu(showMenu === asset.id ? null : asset.id);
                  }}
                  className="p-1.5 hover:bg-gray-700/50 rounded text-gray-400 hover:text-gray-300"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                {showMenu === asset.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-50"
                      onClick={() => setShowMenu(null)}
                    />
                    <div className="absolute right-0 mt-8 w-36 bg-[#252526] rounded-md shadow-lg border border-gray-700/50 py-1 z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingName({ id: asset.id, name: asset.name });
                          setShowMenu(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-700/50"
                      >
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeShaderAsset(asset.id);
                          setShowMenu(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-gray-700/50"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {editingShader?.id === asset.id && (
              <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <ShaderEditor 
                  shader={asset}
                  onClose={() => setEditingShader(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={createNewShader}
        className={cn(
          "flex items-center justify-center gap-2 w-full",
          "px-3 py-2 mt-2 rounded-md border transition-colors",
          "bg-gray-800/40 hover:bg-gray-700/40",
          "border-gray-700/50 hover:border-gray-600/50",
          "text-sm text-gray-400 hover:text-gray-300"
        )}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>New Shader</span>
      </button>
    </div>
  );
}