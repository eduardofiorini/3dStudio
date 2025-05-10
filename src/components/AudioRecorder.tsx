import { useState, useRef } from 'react';
import { Mic, Square, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { useChat } from '../hooks/useChat';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
}

export function AudioRecorder({ onTranscription }: AudioRecorderProps) {
  const { sendMessage } = useChat();
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const startRecording = async () => {
    try {
      // Clear any previous transcription
      onTranscription('');
      setIsSuccess(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setIsProcessing(false);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        setIsProcessing(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Create a mock transcription (simulating what Whisper would do)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Generate a simple mock transcription
      const transcribedText = "This is a simulated transcription. Audio recording is disabled without Supabase.";
      
      if (transcribedText.trim()) {
        onTranscription(transcribedText);
        // Auto-send the transcribed text
        await sendMessage(transcribedText);
        setIsSuccess(true);
        // Reset success state after 2 seconds
        setTimeout(() => setIsSuccess(false), 2000);
        // Don't auto-send here, let the ChatInterface handle it
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to transcribe audio');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={cn(
          "p-2 rounded-full transition-all duration-200 relative",
          isSuccess ? "bg-green-500/10 text-green-400" :
          isRecording
            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
            : "hover:bg-gray-700/50 text-gray-400"
        )}
        title={isProcessing ? "Processing..." : isRecording ? "Stop Recording" : "Start Recording"}
        disabled={isProcessing || isSuccess}
      >
        {isRecording ? (
          <Square className="w-4 h-4" />
        ) : isSuccess ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 rounded-full">
            <div className="w-3 h-3 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </button>

      {error && (
        <div className="absolute bottom-full mb-2 left-0 bg-red-500/10 text-red-400 px-3 py-1 rounded-md text-xs whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}