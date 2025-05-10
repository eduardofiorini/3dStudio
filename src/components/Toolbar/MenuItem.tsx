import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
}

export function MenuItem({ icon: Icon, label, onClick, className }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm w-full text-left",
        "text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors",
        className
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}