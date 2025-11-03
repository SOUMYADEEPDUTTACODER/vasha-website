import { useState, useEffect, useRef } from "react";
import { Play, Pause, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import WaveSurfer from "wavesurfer.js";

interface AudioPlayerProps {
  audioUrl: string;
  fileName?: string;
}

export function AudioPlayer({ audioUrl, fileName = "audio-file.webm" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'var(--primary)',
        progressColor: 'var(--accent)',
        cursorColor: 'transparent',
        barWidth: 2,
        barRadius: 3,
        barGap: 2,
        height: 40,
      });
      
      wavesurfer.load(audioUrl);
      wavesurferRef.current = wavesurfer;
      
      wavesurfer.on('ready', () => {
        setDuration(wavesurfer.getDuration());
        audioRef.current = wavesurfer.getMediaElement() as HTMLAudioElement;
      });
      
      wavesurfer.on('timeupdate', (currentTime) => {
        setCurrentTime(currentTime);
      });
      
      wavesurfer.on('play', () => {
        setIsPlaying(true);
      });
      
      wavesurfer.on('pause', () => {
        setIsPlaying(false);
      });
      
      return () => {
        wavesurfer.destroy();
        wavesurferRef.current = null;
      };
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-card/50 border border-border/40 rounded-lg p-3 space-y-2">
      <div ref={waveformRef} className="w-full"></div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={togglePlayPause} 
            size="sm" 
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            {isPlaying ? 
              <Pause className="h-4 w-4" /> : 
              <Play className="h-4 w-4" />
            }
          </Button>
          
          <Button
            onClick={handleDownload}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}