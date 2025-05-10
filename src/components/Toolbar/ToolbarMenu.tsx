import { LucideIcon } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface ToolbarMenuProps {
  icon: LucideIcon;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function ToolbarMenu({ icon: Icon, label, isOpen, onToggle, children }: ToolbarMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 text-sm",
          "text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
        )}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-[#252526] rounded-md shadow-lg border border-gray-700 p-2 min-w-[160px] z-50">
          {children}
        </div>
      )}
    </div>
  );
}