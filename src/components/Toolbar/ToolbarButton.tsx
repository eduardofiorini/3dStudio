import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

export function ToolbarButton({ icon: Icon, label, onClick, isActive }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}