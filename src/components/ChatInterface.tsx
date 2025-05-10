import { cn } from '../utils/cn';
import { useChat } from '../hooks/useChat';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Send, Loader2, Check, Mic } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const { isLoading, error: chatError, sendMessage, messages } = useChat();
  const [showLogs, setShowLogs] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // 768px is Tailwind's md breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Reset success state after delay
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    if (showLogs && logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [showLogs, messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(input);
    setShowSuccess(true);
  };

  const handleTranscription = (text: string) => {
    setInput(text);
    // Reset input after transcription is sent
    setTimeout(() => {
      setInput('');
    }, 2000); // Match the timing of the success check mark
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle Enter key for text submission
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <div className={cn(
        "absolute z-50 max-w-md mx-auto transition-all duration-300",
        isSmallScreen 
          ? "top-3 left-3 right-3" 
          : "bottom-20 left-3 right-3",
        "flex flex-col gap-2"
      )}>
        {messages.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className={cn(
                "flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300",
                isSmallScreen && "bg-[#252526]/95 backdrop-blur-sm p-2 rounded-md"
              )}
            >
              {showLogs ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
              <span>Chat History ({messages.length})</span>
            </button>
            
            {showLogs && (
              <div 
                ref={logsRef}
                className={cn(
                  "mt-2 p-2 bg-[#252526]/95 backdrop-blur-sm border border-gray-700/50 rounded-md",
                  "max-h-48 overflow-y-auto",
                  isSmallScreen && "max-h-32"
                )}
              >
                {messages.map((msg, i) => (
                  <div key={i} className="mb-2 last:mb-0">
                    <div className="text-xs font-medium text-gray-400 mb-1">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}:
                    </div>
                    <div className={cn(
                      "text-xs whitespace-pre-wrap font-mono",
                      msg.role === 'user' ? "text-gray-300" : "text-blue-300"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {chatError && (
          <div className="mb-2 p-1.5 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-xs text-red-400">{chatError}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a command..."
            className={cn(
              "flex-1 bg-[#252526]/70 backdrop-blur-sm border border-gray-700/50 rounded-md px-4 py-2 pr-10",
              "text-gray-200 placeholder-gray-500 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            )}
          />
          <div className="absolute right-14">
            <AudioRecorder onTranscription={handleTranscription} />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-10 h-10 rounded-md transition-all duration-200 flex items-center justify-center",
              isLoading ? "bg-gray-700/50" :
              showSuccess ? "bg-[#252526]/70 backdrop-blur-sm border border-emerald-500/20" :
              "bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 hover:bg-blue-500/30",
              "text-white disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : showSuccess ? (
              <Check className="w-4 h-4 text-emerald-400/40" />
            ) : (
              <Send className="w-4 h-4 text-blue-400" />
            )}
          </button>
        </form>
      </div>
    </>
  );
}