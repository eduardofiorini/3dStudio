import { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { cn } from '../../utils/cn';
import { DragEvent } from 'react';
import * as THREE from 'three';
import { MaterialEditor } from './MaterialEditor';

interface MaterialAsset {
  id: string;
  name: string;
  material: THREE.MeshStandardMaterial;
}

export function MaterialAssets() {
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingName, setEditingName] = useState<{id: string, name: string} | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<MaterialAsset | null>(null);
  const materials = useEditorStore((state) => state.materialAssets);
  const addMaterialAsset = useEditorStore((state) => state.addMaterialAsset);
  const updateMaterialAsset = useEditorStore((state) => state.updateMaterialAsset);

  const createNewMaterial = () => {
    const material = new THREE.MeshStandardMaterial({
      color: '#808080',
      metalness: 0,
      roughness: 0.7,
      transparent: true,
      opacity: 1
    });

    // Find highest existing material number
    const existingNumbers = materials
      .map(m => {
        const match = m.name.match(/Material(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => !isNaN(n));

    const nextNumber = existingNumbers.length > 0 
      ? Math.max(...existingNumbers) + 1 
      : 1;

    const name = `Material${nextNumber}`;

    addMaterialAsset({
      id: crypto.randomUUID(),
      name,
      material
    });
  };
  const removeMaterialAsset = useEditorStore((state) => state.removeMaterialAsset);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const updateTransform = useEditorStore((state) => state.updateTransform);
  const setDraggedMaterial = useEditorStore((state) => state.setDraggedMaterial);

  const handleCreateMaterial = () => {
    if (!newMaterialName.trim()) return;

    const material = new THREE.MeshStandardMaterial({
      color: '#808080',
      metalness: 0,
      roughness: 0.7,
      transparent: true,
      opacity: 1
    });

    addMaterialAsset({
      id: crypto.randomUUID(),
      name: newMaterialName.trim(),
      material
    });

    setNewMaterialName('');
    setIsCreating(false);
  };

  const applyMaterialToSelected = (material: THREE.Material) => {
    if (!selectedObject || !(selectedObject instanceof THREE.Mesh)) return;
    
    // Remove object from previous material's users
    materials.forEach(asset => {
      removeMaterialUser(asset.id, selectedObject);
    });

    selectedObject.material = material.clone();
    // Add object to new material's users
    addMaterialUser(material.id, selectedObject);
    updateTransform();
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, asset: MaterialAsset) => {
    e.dataTransfer.setData('application/material', asset.id);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedMaterial(asset);
  };

  const handleDragEnd = () => {
    setDraggedMaterial(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 italic">
        Drag material to scene hierarchy to apply
      </p>
      {/* Material List */}
      <div className="space-y-4">
        {materials.map((asset) => (
          <div key={asset.id} className="space-y-2">
            <div 
              className={cn(
                "flex items-center gap-3 p-3 rounded border transition-colors cursor-pointer",
                "bg-gray-800/40 border-gray-700/50",
                "hover:bg-gray-700/40 hover:border-gray-600/50",
                editingMaterial?.id === asset.id && "border-blue-500/50"
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, asset)}
              onDragEnd={handleDragEnd}
              onClick={() => setEditingMaterial(editingMaterial?.id === asset.id ? null : asset)}
            >
              {/* Preview Swatch */}
              <div 
                className={cn(
                  "w-10 h-10 rounded shadow-sm",
                  "ring-1 ring-black/10 ring-inset",
                  "flex-shrink-0"
                )}
                style={{
                  backgroundColor: `#${(asset.material as THREE.MeshStandardMaterial).color.getHexString()}`
                }}
              />
              
              {/* Name & Actions */}
              <div className="flex-1 flex items-center justify-between min-w-0">
                <div className="space-y-0.5">
                  {editingName?.id === asset.id ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (editingName.name.trim()) {
                          updateMaterialAsset(asset.id, { name: editingName.name.trim() });
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
                    <span className="text-sm font-medium text-gray-200">{asset.name}</span>
                  )}
                  <div className="flex items-center gap-2">
                    {(asset.material as THREE.MeshStandardMaterial).map && (
                      <span className="text-xs text-blue-400">Has Texture</span>
                    )}
                    {asset.users.size > 0 && (
                      <span className="text-xs text-gray-500">
                        {asset.users.size} {asset.users.size === 1 ? 'use' : 'uses'}
                      </span>
                    )}
                  </div>
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
                            removeMaterialAsset(asset.id);
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
            </div>
            
            {/* Material Editor */}
            {editingMaterial?.id === asset.id && (
              <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <MaterialEditor 
                  material={asset}
                  onClose={() => setEditingMaterial(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Material */}
      <button
          onClick={createNewMaterial}
          className={cn(
            "flex items-center justify-center gap-2 w-full",
            "px-3 py-2 mt-2 rounded-md border transition-colors",
            "bg-gray-800/40 hover:bg-gray-700/40",
            "border-gray-700/50 hover:border-gray-600/50",
            "text-sm text-gray-400 hover:text-gray-300"
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Material</span>
        </button>
    </div>
  );
}