import { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { cn } from '../utils/cn';

interface ImagePreviewModalProps {
  images: { url: string; label: string }[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImagePreviewModal({ images, currentIndex, onClose, onNavigate }: ImagePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'capture' | 'ai'>(currentIndex === 0 ? 'capture' : 'ai');
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onNavigate(Math.max(0, currentIndex - 1));
    if (e.key === 'ArrowRight') onNavigate(Math.min(images.length - 1, currentIndex + 1));
  }, [currentIndex, images.length, onClose, onNavigate]);

  // Update active tab when navigating
  useEffect(() => {
    setActiveTab(currentIndex === 0 ? 'capture' : 'ai');
  }, [currentIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[700px]">
        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentIndex < images.length - 1 && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Image */}
        <div className="relative bg-[#252526] rounded-lg shadow-xl border border-gray-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
            <div className="flex gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onNavigate(index);
                    setActiveTab(index === 0 ? 'capture' : 'ai');
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-md transition-colors duration-300",
                    index === currentIndex
                      ? "bg-blue-500/20 text-blue-300"
                      : "text-gray-400 hover:bg-gray-700/50"
                  )}
                >
                  {image.label}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700/50 rounded-md text-gray-400 hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative aspect-square">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  index === currentIndex ? "opacity-100" : "opacity-0"
                )}
              >
                <img
                  src={image.url}
                  alt={image.label}
                  className="w-full h-full object-contain p-4"
                />
                <a
                  href={image.url}
                  download={index === 0 ? "capture.png" : "ai-generated.png"}
                  className={cn(
                    "absolute top-6 right-6 p-1.5 transition-colors duration-150 z-10",
                    "text-white/70 hover:text-white",
                    index !== currentIndex && "pointer-events-none opacity-0"
                  )}
                  onClick={e => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}