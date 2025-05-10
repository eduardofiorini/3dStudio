import { useState } from 'react';
import { Camera, Send, Download, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEditorStore } from '../../store/editorStore';
import { ImagePreviewModal } from '../ImagePreviewModal';

export function CapturePanel() {
  const [captures, setCaptures] = useState<string[]>([]);
  const [controlStrength, setControlStrength] = useState(0.8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'capture' | 'ai'>('capture');
  const currentCapture = useEditorStore((state) => state.currentCapture);
  const aiImage = useEditorStore((state) => state.aiImage);
  const setCurrentCapture = useEditorStore((state) => state.setCurrentCapture);
  const setAiImage = useEditorStore((state) => state.setAiImage);
  const prompt = useEditorStore((state) => state.prompt);
  const setPrompt = useEditorStore((state) => state.setPrompt);

  const previewImages = [
    ...(currentCapture ? [{ url: currentCapture, label: 'Viewport' }] : []),
    ...(aiImage ? [{ url: aiImage, label: 'AI Processed' }] : [])
  ];

  const resizeImage = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        // Fill with black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate dimensions to fill square while maintaining aspect ratio
        const scale = Math.max(1024 / img.width, 1024 / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (1024 - scaledWidth) / 2;
        const y = (1024 - scaledHeight) / 2;
        
        // Draw image to fill square
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  };

  const generateAIImage = async (imageDataUrl: string, prompt: string) => {
    try {
      setIsGenerating(true);
      setAiImage(null);
      setError(null);
      
      // Create a mock AI-generated image (a colored version of the original)
      setTimeout(() => {
        try {
          const canvas = document.createElement('canvas');
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Draw the original image
            ctx.drawImage(img, 0, 0);
            
            // Apply a color filter to simulate AI processing
            ctx.fillStyle = `rgba(100, 149, 237, ${0.3 * controlStrength})`;
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Convert to data URL and set as AI image
            const aiImageDataUrl = canvas.toDataURL('image/png');
            setAiImage(aiImageDataUrl);
            setActiveTab('ai');
          };
          img.src = imageDataUrl;
        } catch (err) {
          setError('Failed to generate mock AI image');
        } finally {
          setIsGenerating(false);
        }
      }, 1500); // Simulate processing time
    } catch (err) {
      console.error('Error generating AI image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate AI image');
      setIsGenerating(false);
    } finally {
      // setIsGenerating handled in the timeout
    }
  };

  const captureViewport = () => {
    setCurrentCapture(null);
    setAiImage(null);
    setActiveTab('capture');
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      console.warn('No canvas found');
      return;
    }
    const renderer = (window as any).__THREE_RENDERER__;
    const scene = (window as any).__THREE_SCENE__;
    const camera = (window as any).__THREE_CAMERA__;
    
    if (!renderer || !scene || !camera) {
      console.warn('Missing Three.js components:', { renderer: !!renderer, scene: !!scene, camera: !!camera });
      return;
    }
    
    renderer.render(scene, camera);
    
    try {
      renderer.render(scene, camera);
      
      // Create a temporary canvas for resizing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1024;
      tempCanvas.height = 1024;
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Fill with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1024, 1024);
      
      // Calculate dimensions to fill square while maintaining aspect ratio
      const scale = Math.max(1024 / canvas.width, 1024 / canvas.height);
      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;
      const x = (1024 - scaledWidth) / 2;
      const y = (1024 - scaledHeight) / 2;
      
      // Draw the original canvas onto the temp canvas
      ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
      
      // Get the resized image
      const resizedDataURL = tempCanvas.toDataURL('image/png');
      setCurrentCapture(resizedDataURL);
      
      console.log('Viewport captured successfully');
    } catch (error) {
      console.error('Error capturing viewport:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Capture Button */}
      <button
        onClick={captureViewport}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-md text-sm text-blue-300 transition-colors relative mb-4"
      >
        <Camera className="w-4 h-4" />
        <span>Capture Viewport</span>
      </button>

      {/* Prompt Input */}
      {currentCapture && (
        <div className="space-y-2">
          <div className="relative mb-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
                  e.preventDefault();
                  generateAIImage(currentCapture, prompt);
                }
              }}
              placeholder="Enter your prompt..."
              className="w-full px-4 py-3 pr-12 bg-blue-500/[0.05] border border-blue-500/20 hover:border-blue-500/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-md text-sm text-gray-200 resize-none h-[72px] transition-colors"
            />
            <button
              onClick={() => generateAIImage(currentCapture, prompt)}
              disabled={isGenerating || !prompt}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "w-9 h-9 flex items-center justify-center rounded-md transition-all duration-200",
                isGenerating
                  ? "bg-purple-500/10 text-purple-400"
                  : prompt
                    ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
                    : "text-gray-600 cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 px-1">
            <label className="text-xs text-gray-400">Strength</label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={controlStrength}
                onChange={(e) => setControlStrength(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-700/50 rounded-full appearance-none mr-1
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-3 
                  [&::-webkit-slider-thumb]:h-3 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-blue-500 
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:hover:bg-blue-400
                  [&::-webkit-slider-thumb]:transition-colors"
              />
              <span className="text-xs text-gray-400 w-8 text-right tabular-nums font-medium">
                {controlStrength.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
          {error}
        </div>
      )}

      {/* Image Preview */}
      {(currentCapture || aiImage) && (
        <div className="relative">
          {/* Tabs */}
          <div className="flex gap-2 mb-2">
            {currentCapture && (
              <button
                onClick={() => setActiveTab('capture')}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md transition-colors border border-transparent",
                  activeTab === 'capture' 
                    ? "bg-gray-800/50 text-gray-200 border-gray-700/50" 
                    : "text-gray-400 hover:bg-gray-700/50"
                )}
              >
                Viewport
              </button>
            )}
            {aiImage && (
              <button
                onClick={() => setActiveTab('ai')}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md transition-colors border border-transparent",
                  activeTab === 'ai'
                    ? "bg-gray-800/50 text-gray-200 border-gray-700/50"
                    : "text-gray-400 hover:bg-gray-700/50"
                )}
              >
                AI Processed
              </button>
            )}
          </div>

          {/* Image Container */}
          <div className="relative aspect-square">
            <div className="w-full pb-[100%]" />
            {/* Original Image */}
            {currentCapture && (
              <div 
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  activeTab === 'capture' ? "opacity-100" : "opacity-0"
                )}
              >
                <img
                  src={currentCapture}
                  alt="Original Capture"
                  onClick={() => setPreviewImage(0)}
                  className={cn("relative",
                    "w-full h-full object-cover rounded border",
                    isGenerating 
                      ? "border-purple-500/50" 
                      : "border-gray-700/50 cursor-pointer hover:border-blue-500/50"
                  )}
                />
                <a
                  href={currentCapture}
                  download="capture.png"
                  className={cn(
                    "absolute top-2 right-2 p-1.5 transition-colors duration-150 z-10",
                    "text-white/70 hover:text-white",
                    activeTab !== 'capture' && "pointer-events-none opacity-0"
                  )}
                  title="Download Capture"
                  onClick={e => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )}
            
            {/* AI Generated Image */}
            {aiImage && (
              <div 
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  activeTab === 'ai' ? "opacity-100" : "opacity-0"
                )}
              >
                <img
                  src={aiImage}
                  alt="AI Generated"
                  onClick={() => setPreviewImage(currentCapture ? 1 : 0)}
                  className="relative w-full h-full object-cover rounded border border-gray-700/50 cursor-pointer hover:border-blue-500/50"
                />
                <a
                  href={aiImage}
                  download={activeTab === 'ai' ? "ai-generated.png" : "capture.png"}
                  className={cn(
                    "absolute top-2 right-2 p-1.5 transition-colors duration-150 z-10",
                    "text-white/70 hover:text-white",
                    activeTab !== 'ai' && "pointer-events-none opacity-0"
                  )}
                  title="Download AI Generated"
                  onClick={e => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Preview Modal */}
      {previewImage !== null && previewImages.length > 0 && (
        <ImagePreviewModal
          images={previewImages}
          currentIndex={previewImage}
          onClose={() => setPreviewImage(null)}
          onNavigate={setPreviewImage}
        />
      )}
      <div className="h-4" /> {/* Spacer for saved data UI */}
    </div>
  );
}