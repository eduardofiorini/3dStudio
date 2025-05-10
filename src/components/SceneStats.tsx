import { useEffect, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { Database, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';
import * as THREE from 'three';

interface SceneMetrics {
  objects: number;
  meshes: number;
  triangles: number;
  vertices: number;
}

export function SceneStats() {
  const objects = useEditorStore((state) => state.objects);
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<SceneMetrics>({
    objects: 0,
    meshes: 0,
    triangles: 0,
    vertices: 0
  });

  useEffect(() => {
    let triangles = 0;
    let vertices = 0;
    let meshCount = 0;

    objects.forEach(obj => {
      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
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
  }, [objects]);

  return (
    <div className={cn(
      "absolute bottom-20 left-3 bg-[#252526]/90 backdrop-blur-sm rounded-lg",
      "border border-gray-700/50 text-xs transition-all duration-200",
      isExpanded ? "w-[180px]" : "w-[120px]"
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 text-gray-400 p-2 hover:bg-gray-700/20"
      >
        <Database className="w-3.5 h-3.5" />
        <span className="font-medium flex-1 text-left">Stats</span>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {isExpanded && (
        <div className="px-2 pb-2 space-y-1.5 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-500">Objects</span>
            <span className="font-mono">{metrics.objects}</span>
          </div>

          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-500">Meshes</span>
            <span className="font-mono">{metrics.meshes}</span>
          </div>

          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-500">Triangles</span>
            <span className="font-mono">{metrics.triangles.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-500">Vertices</span>
            <span className="font-mono">{metrics.vertices.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}