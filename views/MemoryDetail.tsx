
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory, Person } from '../types';

interface MemoryDetailProps {
  memory: Memory;
  onBack: () => void;
  onDelete: (id: string) => void;
  onEdit: (memory: Memory) => void;
  people: Person[];
  onExplore: () => void;
  hideLocations: boolean;
}

const MemoryDetail: React.FC<MemoryDetailProps> = ({ memory, onBack, onDelete, onEdit, people, onExplore, hideLocations }) => {
  const taggedPeople = people.filter(p => memory.peopleIds.includes(p.id));
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (!audioRef.current && memory.audioUrl) {
      audioRef.current = new Audio(memory.audioUrl);
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

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-24">
      <nav className="fixed top-0 z-50 flex w-full max-w-md items-center justify-between px-4 py-4 backdrop-blur-lg bg-background-light/80 dark:bg-background-dark/80">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-2xl text-primary">arrow_back_ios_new</span>
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(memory)}
            className="px-4 py-2 text-primary font-medium text-sm tracking-tight hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(memory.id)}
            className="px-4 py-2 text-red-500 font-medium text-sm tracking-tight hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full"
          >
            Delete
          </button>
        </div>
      </nav>

      <main className="flex flex-col flex-1">
        <div className="px-4 pt-20">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-sm">
            <img src={memory.imageUrl} className="h-full w-full object-cover" alt={memory.title} />
            {memory.isHighlight && (
              <div className="absolute top-4 right-4 bg-amber-400 text-white p-2 rounded-full shadow-lg">
                <span className="material-symbols-outlined fill text-xl">star</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pt-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-primary/60 font-medium">
              <span>{memory.date}</span>
              <span className="w-1 h-1 rounded-full bg-primary/20" />
              <span>{memory.time}</span>
            </div>
            <h1 className="mt-2 text-3xl font-news font-medium leading-snug text-text-main dark:text-white">
              {memory.title}
            </h1>
            {hideLocations ? (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-primary/50 self-start">
                <span className="material-symbols-outlined text-[18px]">location_off</span>
                <span className="tracking-tight">Location Hidden</span>
              </div>
            ) : (
              <button 
                onClick={onExplore}
                className="mt-3 flex items-center gap-1.5 text-sm text-primary/70 hover:text-primary transition-colors group self-start"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:animate-bounce">location_on</span>
                <span className="tracking-tight border-b border-transparent group-hover:border-primary/30">{memory.location}</span>
              </button>
            )}
          </div>

          {memory.audioUrl && (
            <div className="mt-6 bg-primary/5 rounded-2xl p-4 flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined text-2xl">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <div className="flex-1">
                 <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Voice Note</div>
                 <div className="h-1 bg-primary/20 rounded-full overflow-hidden w-full">
                   <motion.div 
                     className="h-full bg-primary"
                     initial={{ width: "0%" }}
                     animate={{ width: isPlaying ? "100%" : "0%" }}
                     transition={{ duration: memory.audioDuration || 10, ease: "linear" }}
                   />
                 </div>
              </div>
              <span className="text-xs font-mono text-primary/70">
                {memory.audioDuration ? `${Math.floor(memory.audioDuration / 60)}:${(memory.audioDuration % 60).toString().padStart(2, '0')}` : '0:00'}
              </span>
            </div>
          )}
        </div>

        <div className="px-6 pt-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-card-dark border border-primary/5 dark:border-white/5 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-primary text-[16px] fill">circle</span>
            <span className="text-[11px] uppercase tracking-widest text-primary/80 font-semibold">{memory.mood}</span>
          </div>
        </div>

        {taggedPeople.length > 0 && (
          <div className="px-6 pt-8">
            <p className="text-[11px] uppercase tracking-widest text-primary/50 font-semibold mb-3">With Special People</p>
            <div className="flex flex-wrap gap-2">
              {taggedPeople.map(person => (
                <div key={person.id} className="group flex items-center gap-2 pr-4 pl-1 py-1 bg-white dark:bg-card-dark border border-primary/10 rounded-full shadow-sm">
                  <div className="size-7 rounded-full overflow-hidden bg-primary/20 border border-white">
                    <img alt={person.name} className="w-full h-full object-cover" src={person.imageUrl} />
                  </div>
                  <span className="text-sm font-medium text-primary/80 dark:text-primary-light">{person.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 mt-10">
          <div className="max-w-none">
            <div className="text-xl leading-relaxed text-primary dark:text-primary/90 font-serif italic mb-8 border-l-2 border-primary/30 pl-6 whitespace-pre-line">
              {memory.content}
            </div>
            
            <div className="space-y-6 text-[17px] leading-[1.8] text-text-main/80 dark:text-gray-300 font-jakarta font-light">
              <p>
                Each captured moment is a silent witness to our journey. By recording these small details—the crisp air, the shared laughter, or the quiet solitude—we weave a tapestry of meaning that grows richer with every passing season.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 w-full max-w-md px-6 pb-8 pt-4 bg-gradient-to-t from-background-light to-transparent dark:from-background-dark pointer-events-none">
        <div className="flex items-center justify-around w-full h-14 bg-white/90 dark:bg-card-dark/90 backdrop-blur-xl rounded-full shadow-lg border border-black/[0.03] dark:border-white/5 pointer-events-auto">
           <button onClick={onBack} className="flex items-center justify-center w-full h-full text-primary font-bold uppercase text-[10px] tracking-widest gap-2">
             <span className="material-symbols-outlined text-lg">close</span>
             Close Detail
           </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetail;
