import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { Terminal, Maximize2, X, Plus, FileCode } from 'lucide-react';
import { cn } from '../utils/cn';
import * as THREE from 'three';

interface CodeFile {
  id: string;
  name: string;
  content: string;
}

export function CodePanel({ onClose }: CodePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<CodeFile[]>([
    { 
      id: '1', 
      name: 'main.js', 
      content: '' 
    },
    {
      id: '2',
      name: 'demo.js',
      content: `const particleCount = 15000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = [];
const originalPositions = [];
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

// Physics parameters
const attractionStrength = 0.005;
const maxSpeed = 0.15;
const particleInertia = 0.95;
const returnStrength = 0.01;

// Create super bright attractor
const attractor = new THREE.Mesh(
   new THREE.SphereGeometry(0.5, 32, 32),
   new THREE.MeshStandardMaterial({
       color: 0x000000,
       emissive: 0x4444ff,
       emissiveIntensity: 20,
       transparent: true,
       opacity: 0.9
   })
);

// Add core glow to attractor
const attractorGlow = new THREE.Mesh(
   new THREE.SphereGeometry(0.6, 32, 32),
   new THREE.MeshStandardMaterial({
       color: 0x000000,
       emissive: 0x4444ff,
       emissiveIntensity: 10,
       transparent: true,
       opacity: 0.4
   })
);
attractor.add(attractorGlow);
scene.add(attractor);

// Initialize particles
for(let i = 0; i < particleCount; i++) {
   const i3 = i * 3;
   const theta = Math.random() * Math.PI * 2;
   const phi = Math.acos((Math.random() * 2) - 1);
   const radius = 5 + Math.random() * 5;
   
   positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
   positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
   positions[i3 + 2] = radius * Math.cos(phi);
   
   originalPositions.push({
       x: positions[i3],
       y: positions[i3 + 1],
       z: positions[i3 + 2]
   });
   
   velocities.push({ x: 0, y: 0, z: 0 });

   // Initial colors (pure white)
   colors[i3] = 1.0;      // Red
   colors[i3 + 1] = 1.0;  // Green
   colors[i3 + 2] = 1.0;  // Blue

   // Slightly varied sizes for more dynamic look
   sizes[i] = 0.15 + Math.random() * 0.15;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMaterial = new THREE.ShaderMaterial({
   uniforms: {
       time: { value: 0 },
       diffuse: { value: new THREE.Color(0xffffff) },
   },
   vertexShader: \`
       attribute float size;
       attribute vec3 color;
       varying vec3 vColor;
       uniform float time;
       void main() {
           vColor = color;
           vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
           gl_Position = projectionMatrix * mvPosition;
           gl_PointSize = size * (300.0 / -mvPosition.z);
       }
   \`,
   fragmentShader: \`
       varying vec3 vColor;
       void main() {
           vec2 center = gl_PointCoord - vec2(0.5);
           float dist = length(center);
           float alpha = 1.0 - smoothstep(0.45, 0.5, dist);
           vec3 finalColor = vColor * 5.0 * (1.0 - dist * 0.5);
           gl_FragColor = vec4(finalColor, alpha);
       }
   \`,
   transparent: true,
   blending: THREE.AdditiveBlending,
   depthWrite: false,
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

function animate() {
   requestAnimationFrame(animate);
   const time = Date.now() * 0.001;
   particleMaterial.uniforms.time.value = time;
   
   const positions = particles.attributes.position.array;
   const colors = particles.attributes.color.array;
   const sizes = particles.attributes.size.array;

   for(let i = 0; i < particleCount; i++) {
       const i3 = i * 3;
       
       const dx = attractor.position.x - positions[i3];
       const dy = attractor.position.y - positions[i3 + 1];
       const dz = attractor.position.z - positions[i3 + 2];
       
       const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
       const attractionFactor = Math.max(0, 1 - distance / 10) * attractionStrength;
       
       velocities[i].x += dx * attractionFactor;
       velocities[i].y += dy * attractionFactor;
       velocities[i].z += dz * attractionFactor;
       
       if(distance > 8) {
           const returnX = originalPositions[i].x - positions[i3];
           const returnY = originalPositions[i].y - positions[i3 + 1];
           const returnZ = originalPositions[i].z - positions[i3 + 2];
           
           velocities[i].x += returnX * returnStrength;
           velocities[i].y += returnY * returnStrength;
           velocities[i].z += returnZ * returnStrength;
       }
       
       velocities[i].x *= particleInertia;
       velocities[i].y *= particleInertia;
       velocities[i].z *= particleInertia;
       
       const speed = Math.sqrt(
           velocities[i].x * velocities[i].x + 
           velocities[i].y * velocities[i].y + 
           velocities[i].z * velocities[i].z
       );
       
       if(speed > maxSpeed) {
           velocities[i].x = (velocities[i].x / speed) * maxSpeed;
           velocities[i].y = (velocities[i].y / speed) * maxSpeed;
           velocities[i].z = (velocities[i].z / speed) * maxSpeed;
       }
       
       positions[i3] += velocities[i].x;
       positions[i3 + 1] += velocities[i].y;
       positions[i3 + 2] += velocities[i].z;

       const normalizedSpeed = Math.min(1, speed / maxSpeed);
       
       // Enhanced color transitions with more prominent blue
       if (normalizedSpeed < 0.25) {
           // White to intense blue
           colors[i3] = Math.max(0.2, 1.0 - normalizedSpeed * 4 * 0.8);  // R: 1.0 -> 0.2
           colors[i3 + 1] = Math.max(0.2, 1.0 - normalizedSpeed * 4 * 0.8); // G: 1.0 -> 0.2
           colors[i3 + 2] = 1.0;                            // B: stay 1.0
       } else if (normalizedSpeed < 0.5) {
           // Intense blue to yellow
           const t = (normalizedSpeed - 0.25) * 4;
           colors[i3] = 0.2 + t * 0.8;      // R: 0.2 -> 1.0
           colors[i3 + 1] = 0.2 + t * 0.8;  // G: 0.2 -> 1.0
           colors[i3 + 2] = 1.0 - t;        // B: 1.0 -> 0.0
       } else if (normalizedSpeed < 0.75) {
           // Yellow to orange
           const t = (normalizedSpeed - 0.5) * 4;
           colors[i3] = 1.0;                // R: stay 1.0
           colors[i3 + 1] = 1.0 - t * 0.5;  // G: 1.0 -> 0.5
           colors[i3 + 2] = 0.0;            // B: stay 0.0
       } else {
           // Orange to deep orange/red
           const t = (normalizedSpeed - 0.75) * 4;
           colors[i3] = 1.0;                // R: stay 1.0
           colors[i3 + 1] = 0.5 - t * 0.3;  // G: 0.5 -> 0.2
           colors[i3 + 2] = 0.0;            // B: stay 0.0
       }

       // Make particles near attractor brighter
       const proximityBrightness = Math.max(0, 1 - distance / 3);
       colors[i3] = Math.min(1, colors[i3] + proximityBrightness * 0.5);
       colors[i3 + 1] = Math.min(1, colors[i3 + 1] + proximityBrightness * 0.5);
       colors[i3 + 2] = Math.min(1, colors[i3 + 2] + proximityBrightness * 0.5);

       // Dynamic size based on speed and distance
       sizes[i] = 0.15 + 
                 (normalizedSpeed * 0.3) + 
                 (proximityBrightness * 0.2) +
                 Math.sin(time * 2 + i) * 0.05;
   }
   
   particles.attributes.position.needsUpdate = true;
   particles.attributes.color.needsUpdate = true;
   particles.attributes.size.needsUpdate = true;
   
   // Pulse attractor glow
   attractor.material.emissiveIntensity = 20 + Math.sin(time * 2) * 5;
   attractorGlow.material.emissiveIntensity = 10 + Math.sin(time * 3) * 3;
   
   renderer.render(scene, camera);
}
animate();`
    }
  ]);
  const [activeFileId, setActiveFileId] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState({ width: 450, height: 350 });
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const resizeRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 500, height: 350 });
  const [isRunning, setIsRunning] = useState(false);
  const objects = useEditorStore((state) => state.objects);
  const addObject = useEditorStore((state) => state.addObject);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = size;
    document.body.style.userSelect = 'none';
  }, [size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    
    // Calculate deltas for both directions
    const dx = e.clientX - startPosRef.current.x;
    const dy = startPosRef.current.y - e.clientY;
    
    setSize({
      width: Math.max(500, startSizeRef.current.width + dx),  // Positive dx to grow right
      height: Math.max(350, startSizeRef.current.height + dy) // Negative dy to grow up
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isOpen, handleMouseMove, handleMouseUp]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animationFrameId]);

  const activeFile = files.find(f => f.id === activeFileId);

  const handleAddFile = () => {
    if (!newFileName) return;
    
    // Clean up filename
    let filename = newFileName.trim();
    if (!filename.endsWith('.js')) {
      filename += '.js';
    }
    
    // Check for duplicate names
    if (files.some(f => f.name.toLowerCase() === filename.toLowerCase())) {
      // Add number suffix if name exists
      const baseName = filename.replace('.js', '');
      let counter = 1;
      while (files.some(f => f.name.toLowerCase() === `${baseName}${counter}.js`.toLowerCase())) {
        counter++;
      }
      filename = `${baseName}${counter}.js`;
    }
    
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: filename,
      content: ''
    };
    
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
    setIsAddingFile(false);
    setNewFileName('');
  };

  const handleDeleteFile = (id: string) => {
    if (files.length === 1) return; // Don't delete last file
    setFiles(files.filter(f => f.id !== id));
    if (activeFileId === id) {
      setActiveFileId(files[0].id);
    }
  };

  const updateFileContent = (content: string) => {
    setFiles(files.map(f => 
      f.id === activeFileId ? { ...f, content } : f
    ));
  };

  const executeCode = useCallback(() => {
    try {
      setError(null);
      setIsRunning(true);
      
      const activeFile = files.find(f => f.id === activeFileId);
      if (!activeFile) return;
      
      // Cancel any existing animation
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        setAnimationFrameId(null);
      }
      
      // Create a safe context with limited access to editor functionality
      const context = {
        scene: {
          objects,
          selected: selectedObject,
          add: (object: THREE.Object3D | null) => {
            if (!object) return;
            // Ensure object is properly initialized
            if (object instanceof THREE.Mesh) {
              object.castShadow = true;
              object.receiveShadow = true;
            }
            addObject(object);
          },
          // Add animation helper function
          animate: (callback: () => void) => {
            function animate() {
              const frameId = requestAnimationFrame(animate);
              setAnimationFrameId(frameId);
              callback();
              // Force scene update without needing renderer
              useEditorStore.getState().updateTransform(); 
            }
            animate();
          }
        },
        THREE: {
          ...THREE,
          Mesh: THREE.Mesh,
          BoxGeometry: THREE.BoxGeometry,
          SphereGeometry: THREE.SphereGeometry,
          MeshStandardMaterial: THREE.MeshStandardMaterial,
          Vector3: THREE.Vector3,
          Color: THREE.Color
        }
      };

      // Execute the code with the safe context and handle renderer reference
      const wrappedCode = `
        // Provide scene context
        const renderer = { render: () => {} };
        const camera = null;
        ${activeFile.content}
      `;
      const fn = new Function('scene', 'THREE', wrappedCode);
      const mockRenderer = { render: () => {} };
      fn(context.scene, context.THREE);

      // Force a re-render of the scene
      useEditorStore.getState().updateTransform();
      
      // Show success feedback briefly
      setTimeout(() => {
        setIsRunning(false);
      }, 500);

    } catch (error) {
      setError(error.message);
      setIsRunning(false);
      console.error('Code execution error:', error);
    }
  }, [activeFileId, files, objects, selectedObject, addObject]);

  // Toggle panel with Ctrl+` shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={resizeRef}
      className="absolute bottom-[4.5rem] left-3 bg-[#1e1e1e] rounded-lg shadow-xl border border-gray-700/50 z-50"
      style={{ width: size.width }}
    >
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-700/50">
        <h3 className="text-sm font-medium text-gray-200">Code Panel</h3>
        <div className="flex items-center gap-1">
          <button
            className="p-1 hover:bg-gray-700/50 rounded text-gray-400 cursor-nw-resize"
            onMouseDown={handleMouseDown}
            title="Resize"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700/50 rounded text-gray-400"
            title="Minimize (Ctrl + `)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-1 px-1 py-1 border-b border-gray-700/50 overflow-x-auto">
        {files.map(file => (
          <button
            key={file.id}
            onClick={() => setActiveFileId(file.id)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-xs whitespace-nowrap",
              activeFileId === file.id
                ? "bg-blue-500/20 text-blue-300"
                : "hover:bg-gray-700/50 text-gray-400"
            )}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{file.name}</span>
            {files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(file.id);
                }}
                className="ml-1 hover:text-red-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </button>
        ))}
        
        {isAddingFile ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newFileName.trim()) {
                handleAddFile();
              }
            }}
            className="flex items-center gap-1"
          >
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsAddingFile(false);
                  setNewFileName('');
                }
              }}
              placeholder="filename.js"
              className={cn(
                "w-32 px-2 py-1 bg-gray-800/50 border rounded text-xs text-gray-200",
                "focus:outline-none focus:ring-1 focus:ring-blue-500/50",
                "border-gray-700/50"
              )}
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setIsAddingFile(false);
                setNewFileName('');
              }}
              className="p-1 hover:bg-gray-700/50 rounded text-gray-500"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingFile(true)}
            className="p-1 hover:bg-gray-700/50 rounded text-gray-500"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="p-2">
        <textarea
          value={activeFile?.content ?? ''}
          onChange={(e) => updateFileContent(e.target.value)}
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
            "w-full h-[200px] p-2 bg-[#252526] rounded border border-gray-700/50",
            "text-sm font-mono text-gray-300",
            "focus:outline-none focus:ring-1 focus:ring-blue-500/50",
            "resize-none text-xs"
          )}
          style={{ height: size.height }}
        />
        {error && (
          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
            {error}
          </div>
        )}
      </div>
      
      <div className="p-2 border-t border-gray-700/50">
        <button
          onClick={executeCode}
          className={cn(
            "w-full py-1.5 rounded text-sm transition-colors relative",
            isRunning 
              ? "bg-green-500 text-white" 
              : "bg-blue-500 hover:bg-blue-600 text-white"
          )}
          disabled={isRunning}
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-pulse">Running...</span>
            </span>
          ) : (
            <span>Run {activeFile?.name}</span>
          )}
        </button>
      </div>
    </div>
  );
}