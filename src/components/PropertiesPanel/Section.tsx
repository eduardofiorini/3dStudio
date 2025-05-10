import React, { useState, ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface SectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  id: string;
}

export function Section({ title, children, icon, id }: SectionProps) {
  const isExpanded = useEditorStore((state) => state.isMenuExpanded(id));
  const toggleMenu = useEditorStore((state) => state.toggleMenu);
  
  return (
    <div className="border-b border-gray-700/50 last:border-b-0 pb-4">
      <button
        onClick={() => toggleMenu(id)}
        className="flex items-center gap-2 w-full py-1.5 px-1 hover:bg-gray-700/30 rounded"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
        {icon && <span className="text-gray-500">{icon}</span>}
        <span className="text-xs font-medium text-gray-300">{title}</span>
      </button>
      {isExpanded && <div className="mt-3 space-y-4 px-1">{children}</div>}
    </div>
  );
}