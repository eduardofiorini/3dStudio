import { Droplets, Flame, Snowflake, Cloud } from 'lucide-react';
import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { createParticleFountain, createParticleFire, createParticleSnow, createParticleDust } from '../../../utils/objects';
import { ToolbarMenu } from '../ToolbarMenu';

export function ParticlesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const addObject = useEditorStore((state) => state.addObject);

  const handleCreateParticles = (type: string) => {
    let particles;
    switch (type) {
      case 'fountain':
        particles = createParticleFountain();
        break;
      case 'fire':
        particles = createParticleFire();
        break;
      case 'snow':
        particles = createParticleSnow();
        break;
      case 'dust':
        particles = createParticleDust();
        break;
    }
    if (particles) {
      addObject(particles);
      setIsOpen(false);
    }
  };

  return (
    <ToolbarMenu
      icon={Droplets}
      label="Particles"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      <button
        onClick={() => handleCreateParticles('fountain')}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Droplets className="w-4 h-4" />
        <span>Fountain</span>
      </button>
      <button
        onClick={() => handleCreateParticles('fire')}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Flame className="w-4 h-4" />
        <span>Fire</span>
      </button>
      <button
        onClick={() => handleCreateParticles('snow')}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Snowflake className="w-4 h-4" />
        <span>Snow</span>
      </button>
      <button
        onClick={() => handleCreateParticles('dust')}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors w-full text-left"
      >
        <Cloud className="w-4 h-4" />
        <span>Dust</span>
      </button>
    </ToolbarMenu>
  );
}