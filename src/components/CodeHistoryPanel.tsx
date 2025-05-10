import { useState } from 'react';
import { useCodeStore } from '../store/codeStore';
import { Clock, ChevronDown, ChevronUp, Code } from 'lucide-react';
import { cn } from '../utils/cn';

export function CodeHistoryPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Start hidden by default
  const codeHistory = useCodeStore((state) => state.codeHistory);
  const namedScripts = useCodeStore((state) => state.namedScripts);
  const scriptCategories = useCodeStore((state) => state.scriptCategories);
  const currentCode = useCodeStore((state) => state.currentCode);
  const saveScript = useCodeStore((state) => state.saveScript);

  const handleSaveCurrentCode = () => {
    if (currentCode) {
      const name = prompt('Enter a name for this script:');
      if (name) {
        const category = prompt('Enter a category (optional):', 'default');
        saveScript(name, currentCode, category || 'default');
      }
    }
  };

  // Hide completely if no history and not manually shown
  if ((!codeHistory.length && !namedScripts.size) || !isVisible) return null;

  return (
    <div className="absolute bottom-20 left-3 w-[300px] bg-[#252526]/90 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 p-2 hover:bg-gray-700/20"
      >
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-medium">Code History</span>
          <span className="text-xs text-gray-500">
            ({codeHistory.length} changes)
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-700/50">
          {/* Named Scripts */}
          {scriptCategories.size > 0 && (
            <div className="p-2 border-b border-gray-700/50">
              <h3 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Code className="w-3.5 h-3.5" />
                <span>Saved Scripts</span>
              </h3>
              {Array.from(scriptCategories.entries()).map(([category, scripts]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="text-xs font-medium text-gray-500 mb-2">{category}</div>
                  {Array.from(scripts).map(name => {
                    const code = namedScripts.get(name);
                    return code && (
                      <div key={name} className="mb-2 last:mb-0">
                        <div className="text-xs text-blue-400 mb-1">{name}</div>
                        <pre className="text-[11px] font-mono bg-gray-800/50 p-2 rounded overflow-x-auto text-gray-300">
                          {code}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Code History */}
          <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
            {codeHistory.map((code, index) => (
              <div
                key={index}
                className={cn(
                  "p-2 rounded text-[11px] font-mono",
                  "bg-gray-800/50 text-gray-300",
                  code === currentCode && "ring-1 ring-blue-500/50"
                )}
              >
                {code}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}