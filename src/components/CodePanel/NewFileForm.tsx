import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useState } from 'react';
import { NewFileFormProps } from './types';

export function NewFileForm({ onSubmit, onCancel }: NewFileFormProps) {
  const [fileName, setFileName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim()) {
      onSubmit(fileName);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onCancel();
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
        onClick={onCancel}
        className="p-1 hover:bg-gray-700/50 rounded text-gray-500"
        title="Cancel"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}