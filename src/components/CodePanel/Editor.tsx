import { cn } from '../../utils/cn';
import { EditorProps } from './types';

export function Editor({ content, onChange, height }: EditorProps) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`// Quick Note: Three.js environment is already set up (scene, camera, lights, renderer)
//
// Single object:
// const obj = new THREE.Mesh(geometry, material)
// scene.add(obj)
// 
// Multiple objects:
// const objects = []
// for(let i = 0; i < count; i++) {
//   objects.push(new THREE.Mesh(geometry, material))
//   objects[i].userData = { /* base values */ }
//   scene.add(objects[i])
// }
//
// animate() { objects.forEach(obj => { /* animate */ }) }`}
      className={cn(
        "w-full p-2 bg-[#252526] rounded border border-gray-700/50",
        "text-sm font-mono text-gray-300",
        "focus:outline-none focus:ring-1 focus:ring-blue-500/50",
        "resize-none text-xs"
      )}
      style={{ height }}
    />
  );
}