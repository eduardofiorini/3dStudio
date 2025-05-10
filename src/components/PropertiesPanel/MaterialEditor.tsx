import { useState, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { MaterialAsset } from '../../store/slices/materialAssetsSlice';
import { cn } from '../../utils/cn';
import { Image, X } from 'lucide-react';
import { MATERIAL_PRESETS, MaterialType } from '../../utils/materials/types';
import * as THREE from 'three';

interface MaterialEditorProps {
  material: MaterialAsset;
  onClose: () => void;
}

export function MaterialEditor({ material, onClose }: MaterialEditorProps) {
  const updateMaterialAsset = useEditorStore((state) => state.updateMaterialAsset);
  const [localMaterial, setLocalMaterial] = useState(material.material.clone());
  const [materialType, setMaterialType] = useState<MaterialType>(
    localMaterial instanceof THREE.MeshPhysicalMaterial ? 'physical' :
    (!localMaterial.colorWrite && localMaterial.depthWrite) ? 'hider' : 'standard'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (updates: Partial<THREE.MeshStandardMaterial>) => {
    const updatedMaterial = localMaterial as THREE.MeshStandardMaterial;
    
    Object.entries(updates).forEach(([key, value]) => {
      updatedMaterial[key] = value;
    });
    
    updatedMaterial.needsUpdate = true;
    setLocalMaterial(updatedMaterial);
    
    updateMaterialAsset(material.id, {
      ...material,
      material: updatedMaterial
    });
  };

  const handleMaterialTypeChange = (type: MaterialType) => {
    const preset = MATERIAL_PRESETS[type];
    if (!preset) return;

    // Create new material of selected type
    const newMaterial = preset.create({
      color: '#' + (localMaterial as THREE.MeshStandardMaterial).color.getHexString(),
      metalness: (localMaterial as THREE.MeshStandardMaterial).metalness,
      roughness: (localMaterial as THREE.MeshStandardMaterial).roughness,
      opacity: (localMaterial as THREE.MeshStandardMaterial).opacity,
      transparent: (localMaterial as THREE.MeshStandardMaterial).transparent
    });

    // Copy over textures if they exist
    if ((localMaterial as THREE.MeshStandardMaterial).map) {
      newMaterial.map = (localMaterial as THREE.MeshStandardMaterial).map;
    }

    setLocalMaterial(newMaterial);
    setMaterialType(type);
    
    updateMaterialAsset(material.id, {
      ...material,
      material: newMaterial
    });
  };

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      console.warn('Invalid file type. Please upload an image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      const texture = new THREE.TextureLoader().load(event.target.result as string, 
        // Success callback
        (loadedTexture) => {
          loadedTexture.needsUpdate = true;
          handleUpdate({ 
            map: loadedTexture,
            needsUpdate: true 
          });
        },
        // Progress callback
        undefined,
        // Error callback
        (error) => {
          console.error('Error loading texture:', error);
        }
      );

      // Set texture properties
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.encoding = THREE.sRGBEncoding;
    };
    
    reader.readAsDataURL(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Material Type Selector */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Material Type</label>
        <select
          value={materialType}
          onChange={(e) => handleMaterialTypeChange(e.target.value as MaterialType)}
          className="w-full py-1 px-2 bg-gray-800/40 border border-gray-700/50 rounded text-xs text-gray-200"
        >
          {Object.entries(MATERIAL_PRESETS).map(([type, preset]) => (
            <option key={type} value={type}>{preset.label}</option>
          ))}
        </select>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleTextureUpload}
        className="hidden"
      />

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Base Color</label>
          <input
            type="color"
            value={`#${(localMaterial as THREE.MeshStandardMaterial).color.getHexString()}`}
            onChange={(e) => {
              handleUpdate({ color: new THREE.Color(e.target.value) });
            }}
            className="w-5 h-5 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Texture */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Texture</label>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-1.5 py-1 bg-gray-800/50 hover:bg-gray-700/50 rounded text-[11px] text-gray-400"
          >
            <Image className="w-3.5 h-3.5" />
            <span>{(localMaterial as THREE.MeshStandardMaterial).map ? 'Change' : 'Add'}</span>
          </button>
        </div>
      </div>

      {/* Metalness */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Metalness</label>
          <span className="text-xs text-gray-400">
            {(localMaterial as THREE.MeshStandardMaterial).metalness.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={(localMaterial as THREE.MeshStandardMaterial).metalness}
          onChange={(e) => handleUpdate({ metalness: parseFloat(e.target.value) })}
          className="w-full h-1.5"
        />
      </div>

      {/* Roughness */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Roughness</label>
          <span className="text-xs text-gray-400">
            {(localMaterial as THREE.MeshStandardMaterial).roughness.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={(localMaterial as THREE.MeshStandardMaterial).roughness}
          onChange={(e) => handleUpdate({ roughness: parseFloat(e.target.value) })}
          className="w-full h-1.5"
        />
      </div>

      {/* Emissive Color */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Emissive Color</label>
          <input
            type="color"
            value={`#${(localMaterial as THREE.MeshStandardMaterial).emissive.getHexString()}`}
            onChange={(e) => {
              handleUpdate({ emissive: new THREE.Color(e.target.value) });
            }}
            className="w-5 h-5 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Emissive Intensity */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Emissive Intensity</label>
          <span className="text-xs text-gray-400">
            {(localMaterial as THREE.MeshStandardMaterial).emissiveIntensity.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={(localMaterial as THREE.MeshStandardMaterial).emissiveIntensity}
          onChange={(e) => handleUpdate({ emissiveIntensity: parseFloat(e.target.value) })}
          className="w-full h-1.5"
        />
      </div>

      {/* Opacity */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Opacity</label>
          <span className="text-xs text-gray-400">
            {(localMaterial as THREE.MeshStandardMaterial).opacity.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={(localMaterial as THREE.MeshStandardMaterial).opacity}
          onChange={(e) => {
            const opacity = parseFloat(e.target.value);
            handleUpdate({ 
              opacity,
              transparent: opacity < 1
            });
          }}
          className="w-full h-1.5"
        />
      </div>
    </div>
  );
}