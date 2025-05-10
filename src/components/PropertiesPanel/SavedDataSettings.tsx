import { useEditorStore } from '../../store/editorStore';
import { Trash2, Save, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useState, useEffect } from 'react';

export function SavedDataSettings() {
  const saveScene = useEditorStore((state) => state.saveScene);
  const loadScene = useEditorStore((state) => state.loadScene);
  const clearSavedScene = useEditorStore((state) => state.clearSavedScene);
  const hasSavedScene = useEditorStore((state) => state.hasSavedScene);
  const getLastSaveDate = useEditorStore((state) => state.getLastSaveDate);
  const [showClearSuccess, setShowClearSuccess] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showLoadSuccess, setShowLoadSuccess] = useState(false);

  const lastSaveDate = getLastSaveDate();
  const hasScene = hasSavedScene();

  const handleClear = () => {
    clearSavedScene();
    setShowClearSuccess(true);
    setTimeout(() => setShowClearSuccess(false), 2000);
  };

  const handleSave = () => {
    saveScene();
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleLoad = () => {
    loadScene();
    setShowLoadSuccess(true);
    setTimeout(() => setShowLoadSuccess(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-2 text-xs text-yellow-200/90 flex items-center gap-2">
        <span className="text-yellow-500">⚠️</span>
        <span>Experimental: Scene saving is still in development</span>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleSave}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2",
            showSaveSuccess ? "bg-green-500/20 text-green-200" : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-200",
            "rounded-md text-xs border border-blue-500/20 transition-colors"
          )}
        >
          {showSaveSuccess ? (
            <>
              <span className="text-green-200">✓</span>
              <span>Scene Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Scene</span>
            </>
          )}
        </button>

        {hasScene && (
          <>
            <div className="flex gap-2">
              <button
                onClick={handleLoad}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2",
                  showLoadSuccess 
                    ? "bg-green-500/20 text-green-200" 
                    : "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300",
                  "rounded-md text-xs border border-gray-700/50 transition-colors"
                )}
              >
                {showLoadSuccess ? (
                  <>
                    <span className="text-green-200">✓</span>
                    <span>Scene Loaded!</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Load Scene</span>
                  </>
                )}
              </button>
              <button
                onClick={handleClear}
                className={cn(
                  "flex items-center justify-center gap-2 px-3 py-2",
                  showClearSuccess
                    ? "bg-green-500/20 text-green-200"
                    : "bg-red-500/20 hover:bg-red-500/30 text-red-200",
                  "rounded-md text-xs border border-red-500/20 transition-colors"
                )}
              >
                {showClearSuccess ? (
                  <>
                    <span className="text-green-200">✓</span>
                    <span>Scene Cleared!</span>
                  </>
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {lastSaveDate && (
              <p className="text-xs text-gray-500">
                Last saved: {new Date(lastSaveDate).toLocaleString()}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}