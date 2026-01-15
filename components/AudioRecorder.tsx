import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioRecorderProps {
  onRecordingComplete: (audioUrl: string, duration: number) => void;
  onDelete: () => void;
  initialAudioUrl?: string;
  initialDuration?: number;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete, 
  onDelete,
  initialAudioUrl,
  initialDuration 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to Base64 for persistence
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioUrl(base64Audio);
          onRecordingComplete(base64Audio, recordingTime);
        };
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Cannot access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current && audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDelete = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    onDelete();
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-card-dark/50 rounded-2xl p-4 border border-slate-100 dark:border-white/10">
      <div className="flex items-center justify-between">
        {!audioUrl ? (
          // Recording State
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-red-500 shadow-lg shadow-red-500/20 animate-pulse' 
                  : 'bg-primary text-white shadow-lg shadow-primary/20'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {isRecording ? 'stop' : 'mic'}
              </span>
            </button>
            
            <div className="flex-1">
              {isRecording ? (
                <div className="flex items-center gap-2">
                  <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-red-500 font-mono font-medium">
                    Recording {formatTime(recordingTime)}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 text-sm">Tap mic to record voice memory</span>
              )}
            </div>
          </div>
        ) : (
          // Playback State
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <div className="flex-1 h-8 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex items-center px-3 relative">
               {/* Simple visualizer bars */}
               <div className="flex items-center gap-0.5 h-full w-full justify-center opacity-50">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      animate={{ 
                        height: isPlaying ? [10, 20, 10] : 10 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.5, 
                        delay: i * 0.05 
                      }}
                    />
                  ))}
               </div>
               <span className="absolute right-3 text-xs font-mono text-slate-500">
                 {formatTime(initialDuration || recordingTime)}
               </span>
            </div>

            <button
              onClick={handleDelete}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
