import { X } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { cn } from '../utils/cn';
import { useEffect, useState } from 'react';
import { Object3D, Mesh, Light, Material } from 'three';
import { ChevronRight, ChevronDown, FileCode } from 'lucide-react';

interface SceneDebugDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SceneMetrics {
  objects: number;
  meshes: number;
  triangles: number;
  vertices: number;
}

interface GLBStatusProps {
  objects: Object3D[];
}

function GLBStatus({ objects }: GLBStatusProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const glbObjects = objects.filter(obj => obj.userData.isGLBModel);

  if (glbObjects.length === 0) return null;

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-2 hover:bg-gray-700/20 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
        <FileCode className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-medium text-blue-200">GLB Models ({glbObjects.length})</span>
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-blue-500/20 space-y-2">
          {glbObjects.map(obj => {
            const meshCount = Array.from(obj.children).filter(child => child instanceof Mesh).length;
            return (
              <div key={obj.uuid} className="flex items-center gap-2 text-xs">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full flex-shrink-0",
                  obj.userData.isGLBModel ? "bg-green-400" : "bg-red-400"
                )} />
                <span className="text-gray-300">{obj.userData.originalName || 'Unnamed GLB'}</span>
                <span className="text-gray-500">{meshCount}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ObjectDetailsProps {
  object: Object3D;
  isSelected: boolean;
}

function ObjectDetails({ object, isSelected }: ObjectDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const info = getObjectInfo(object);

  return (
    <div className={cn(
      "rounded-lg overflow-hidden transition-colors duration-150",
      isSelected ? "bg-blue-500/10 border border-blue-500/20" : "bg-gray-800/40 border border-gray-700/50"
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-2 hover:bg-gray-700/20 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-xs font-medium text-gray-300">{object.userData.objectType || object.type}</span>
        <span className="text-xs text-gray-500 ml-2">ID: {object.uuid.slice(0, 8)}</span>
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-gray-700/50 bg-gray-900/30">
          <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto text-gray-300">
            {JSON.stringify(info, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Helper function to get compact object info
const getObjectInfo = (obj: Object3D) => {
  const info: Record<string, any> = {
    id: obj.uuid.slice(0, 8),
    name: obj.name || obj.userData.originalName || 'Unnamed',
    type: obj.type,
    isGLB: obj.userData.isGLBModel || false,
    position: obj.position.toArray().map(v => v.toFixed(2)),
    rotation: obj.rotation.toArray().slice(0, 3).map(v => (v * 180 / Math.PI).toFixed(2))
  };

  // Add GLB model info
  if (obj.userData.isGLBModel) {
    info.glb = {
      name: obj.name || obj.userData.originalName || 'Unnamed GLB',
      modelId: obj.userData.modelId,
      originalName: obj.userData.originalName,
      meshCount: 0,
      materialCount: 0,
      flags: {
        root: obj.userData.isGLBModel || false,
        childrenHaveFlag: false
      }
    };
    // Count meshes and materials
    obj.traverse(child => {
      if (child instanceof Mesh) {
        info.glb.meshCount++;
        if (child.material) {
          info.glb.materialCount++;
        }
        // Check if child has GLB flag
        if (child.userData.isGLBModel) {
          info.glb.flags.childrenHaveFlag = true;
        }
      }
    });
  }
  // Add physics info if enabled
  if (obj.userData.physicsEnabled) {
    info.physics = {
      type: obj.userData.physicsType,
      hasRigidBody: !!obj.userData.rigidBody
    };
  }

  // Add material info if it's a mesh
  if (obj instanceof Mesh) {
    const material = obj.material as Material;
    if ('color' in material) {
      info.material = {
        color: '#' + material.color.getHexString(),
        opacity: material.opacity
      };
    }
  }

  // Add light info
  if (obj.userData.isLight) {
    info.light = {
      intensity: (obj as Light).intensity,
      color: '#' + (obj as Light).color.getHexString()
    };
  }

  return info;
};

export function SceneDebugDialog({ isOpen, onClose }: SceneDebugDialogProps) {
  const objects = useEditorStore((state) => state.objects);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const [metrics, setMetrics] = useState<SceneMetrics>({
    objects: 0,
    meshes: 0,
    triangles: 0,
    vertices: 0
  });

  // Console log scene info when dialog opens
  useEffect(() => {
    if (isOpen) {
      let triangles = 0;
      let vertices = 0;
      let meshCount = 0;

      objects.forEach(obj => {
        obj.traverse(child => {
          if (child instanceof Mesh) {
            meshCount++;
            if (child.geometry) {
              const position = child.geometry.getAttribute('position');
              if (position) vertices += position.count;
              if (child.geometry.index) {
                triangles += child.geometry.index.count / 3;
              } else if (position) {
                triangles += position.count / 3;
              }
            }
          }
        });
      });

      setMetrics({
        objects: objects.length,
        meshes: meshCount,
        triangles,
        vertices
      });
    }
  }, [isOpen, objects]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50">
      <div className={cn(
        "bg-[#252526] rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col",
        "transform transition-all duration-200"
      )}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-200">Scene Debug Info</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-700/50 rounded-md text-gray-400 hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-2">
            {/* Scene Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-xs text-blue-300 mb-1">Objects</div>
                <div className="text-xl font-mono text-blue-200">{metrics.objects}</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-xs text-blue-300 mb-1">Meshes</div>
                <div className="text-xl font-mono text-blue-200">{metrics.meshes}</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-xs text-blue-300 mb-1">Triangles</div>
                <div className="text-xl font-mono text-blue-200">{metrics.triangles.toLocaleString()}</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-xs text-blue-300 mb-1">Vertices</div>
                <div className="text-xl font-mono text-blue-200">{metrics.vertices.toLocaleString()}</div>
              </div>
            </div>

            {/* GLB Status */}
            <GLBStatus objects={objects} />

            {/* Object Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-200 mb-2">Object Details</h3>
              <div className="space-y-2">
                {objects.map((obj) => (
                  <ObjectDetails
                    key={obj.uuid}
                    object={obj}
                    isSelected={obj === selectedObject}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}