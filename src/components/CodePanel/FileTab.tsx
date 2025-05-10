import { X, FileCode } from 'lucide-react';
import { cn } from '../../utils/cn';
import { FileTabProps } from './types';

export function FileTab({ file, isActive, onSelect, onDelete }: FileTabProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded text-xs whitespace-nowrap",
        isActive
          ? "bg-blue-500/20 text-blue-300"
          : "hover:bg-gray-700/50 text-gray-400"
      )}
    >
      <FileCode className="w-3.5 h-3.5" />
      <span>{file.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="ml-1 hover:text-red-400"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </button>
  );
}