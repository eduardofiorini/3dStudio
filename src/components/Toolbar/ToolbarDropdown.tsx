import { LucideIcon } from 'lucide-react';
import { ReactNode, useRef, useEffect } from 'react';
import { ToolbarButton } from './ToolbarButton';

interface ToolbarDropdownProps {
  icon: LucideIcon;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function ToolbarDropdown({ icon, label, isOpen, onToggle, children }: ToolbarDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={menuRef}>
      <ToolbarButton icon={icon} label={label} onClick={onToggle} />
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-[#252526] rounded-md shadow-lg border border-gray-700 p-2 min-w-[200px] z-50">
          {children}
        </div>
      )}
    </div>
  );
}