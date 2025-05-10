import { Grid } from 'lucide-react';
import { useState } from 'react';
import { ArrayModifierDialog } from '../ArrayModifierDialog';

export function ArrayButton() {
  const [showDialog, setShowDialog] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
      >
        <Grid className="w-4 h-4" />
        <span>Array</span>
      </button>
      {showDialog && (
        <>
          <div className="absolute top-full left-0 mt-1 z-50">
            <ArrayModifierDialog onClose={() => setShowDialog(false)} />
          </div>
          <div 
            className="fixed inset-0 z-40 pointer-events-none" 
            onClick={() => setShowDialog(false)}
          />
        </>
      )}
    </div>
  );
}