import { X, Keyboard, Mouse, Move, RotateCw, Maximize2, Save, Trash2, XCircle, Hand, Copy, Clipboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ControlGroupProps {
  title: string;
  children: React.ReactNode;
}

function ControlGroup({ title, children }: ControlGroupProps) {
  return (
    <div className="bg-gray-800/50 p-3 rounded-md">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700/50">
        <p className="text-xs text-gray-400">{title}</p>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200); // Match transition duration
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className={`bg-[#252526] rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4 transform transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            Editor Controls
          </h2>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-gray-700/50 rounded-md text-gray-400 hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <ControlGroup title="Mouse Controls">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Mouse className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Selection Box</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Left + Drag</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <Mouse className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Context Menu</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Shift + Right Click</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCw className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Orbit</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Middle + Drag</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCw className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Orbit</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Right + Drag</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <Move className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Zoom</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Scroll</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <Hand className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Pan</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Shift + MMB</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <Hand className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Pan</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Shift + RMB</kbd>
                </div>
              </div>
            </ControlGroup>

            <ControlGroup title="Touchpad Controls">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Mouse className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Selection Box</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>One Finger</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCw className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Orbit</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Two Fingers</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <Hand className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Pan</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Shift + Two</kbd>
                </div>
              </div>
            </ControlGroup>

          </div>

          {/* Right Column */}
          <div className="space-y-4 flex-1">
            <ControlGroup title="Transform Controls">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Move className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Position</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>W</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCw className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Rotate</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>E</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Scale</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>R</kbd>
                </div>
              </div>
            </ControlGroup>
            
            <ControlGroup title="Selection Controls">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Copy</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Ctrl/⌘ + C</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <Clipboard className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Paste</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Ctrl/⌘ + V</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Delete</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Delete/Backspace</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Deselect</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Esc</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <Save className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-300">Save Scene</span>
                  <kbd className={cn(
                    "px-2 py-1 bg-gray-900/50 rounded text-xs font-mono",
                    "border border-gray-700/50 text-gray-400"
                  )}>Ctrl + S</kbd>
                </div>
              </div>
            </ControlGroup>
          </div>
        </div>
      </div>
    </div>
  );
}