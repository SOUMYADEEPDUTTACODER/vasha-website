import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
}

export function AudioRecorder({ onAudioReady }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopMediaTracks();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    chunksRef.current = [];
    setIsLoading(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioReady(audioBlob);
        stopMediaTracks();
        setIsRecording(false);
        setRecordingTime(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsLoading(false);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsLoading(false);
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          size="icon"
          variant="outline"
          className="hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      ) : (
        <>
          <div className="flex items-center space-x-2 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-red-500">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs font-medium">{formatTime(recordingTime)}</span>
          </div>
          <Button
            onClick={stopRecording}
            size="icon"
            variant="outline"
            className="bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors"
          >
            <Square className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}