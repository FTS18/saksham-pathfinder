import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface ReadingAssistantProps {
  text: string;
  isVisible: boolean;
}

export const ReadingAssistant = ({ text, isVisible }: ReadingAssistantProps) => {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const newUtterance = new SpeechSynthesisUtterance(text);
      
      newUtterance.rate = 0.9;
      newUtterance.pitch = 1.1;
      newUtterance.volume = 0.9;
      newUtterance.lang = 'en-US';
      
      newUtterance.onstart = () => {
        setIsReading(true);
        setIsPaused(false);
      };
      
      newUtterance.onend = () => {
        setIsReading(false);
        setIsPaused(false);
      };
      
      newUtterance.onerror = () => {
        setIsReading(false);
        setIsPaused(false);
      };
      
      setUtterance(newUtterance);
    }
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  const startReading = () => {
    if (utterance && window.speechSynthesis) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.speak(utterance);
      }
      setIsReading(true);
    }
  };

  const pauseReading = () => {
    if (window.speechSynthesis && isReading) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsReading(false);
    }
  };

  const stopReading = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setIsPaused(false);
    }
  };

  if (!isVisible || !('speechSynthesis' in window)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">🔊 Reading Assistant:</span>
      <div className="flex gap-2">
        {!isReading && !isPaused && (
          <Button
            size="sm"
            variant="ghost"
            onClick={startReading}
            className="h-6 w-6 p-0 hover:bg-primary/20"
          >
            <Play className="w-3 h-3" />
          </Button>
        )}
        
        {isReading && (
          <Button
            size="sm"
            variant="ghost"
            onClick={pauseReading}
            className="h-6 w-6 p-0 hover:bg-primary/20"
          >
            <Pause className="w-3 h-3" />
          </Button>
        )}
        
        {isPaused && (
          <Button
            size="sm"
            variant="ghost"
            onClick={startReading}
            className="h-6 w-6 p-0 hover:bg-primary/20"
          >
            <Volume2 className="w-3 h-3" />
          </Button>
        )}
        
        {(isReading || isPaused) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={stopReading}
            className="h-6 w-6 p-0 hover:bg-destructive/20 text-destructive"
          >
            <VolumeX className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};