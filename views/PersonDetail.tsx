
import React from 'react';
import { Person, Memory } from '../types';

interface PersonDetailProps {
  person: Person;
  memories: Memory[];
  onBack: () => void;
  onSelectMemory: (memory: Memory) => void;
  onDelete: (id: string) => void;
  hideLocations?: boolean;
}

const PersonDetail: React.FC<PersonDetailProps> = ({ person, memories, onBack, onSelectMemory, onDelete, hideLocations }) => {
  const sortedMemories = [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar">
      <header className="relative w-full aspect-[4/3] shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-110" style={{ backgroundImage: `url("${person.imageUrl}")` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-black/30" />
        
        <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <button 
            onClick={onBack} 
            className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 text-white rounded-full size-12 flex items-center justify-center shadow-lg transition-transform active:scale-90 hover:bg-white/30"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 text-white rounded-full size-12 flex items-center justify-center shadow-lg"
            >
              <span className="material-symbols-outlined text-2xl">more_vert</span>
            </button>
            
            {showMenu && (
              <div className="absolute top-full right-0 mt-2 min-w-[160px] bg-white dark:bg-card-dark rounded-xl shadow-xl border border-primary/10 dark:border-white/10 overflow-hidden py-1 z-50">
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(person.id);
                  }}
                  className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Delete Person
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-1 z-10">
          <h1 className="text-5xl font-display font-bold text-text-main dark:text-white leading-tight drop-shadow-md">{person.name}</h1>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-teal-accent text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
              {person.role}
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <span className="text-text-main/80 dark:text-gray-300 text-sm font-jakarta font-semibold tracking-tight">{memories.length} Shared Moments</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 pt-10 pb-32">
        {person.bio && (
          <div className="mb-12">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted dark:text-gray-500 mb-4 px-1">Reflections</h2>
            <div className="relative">
              <span className="absolute -top-4 -left-2 text-6xl text-primary/10 font-serif italic pointer-events-none">“</span>
              <p className="text-text-main dark:text-gray-100 font-news italic text-xl leading-relaxed bg-white/50 dark:bg-card-dark/50 p-6 rounded-3xl border border-primary/5 shadow-whisper relative z-10">
                {person.bio}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8 border-b border-primary/10 dark:border-white/10 pb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">auto_stories</span>
            <h2 className="text-xl font-bold font-display text-text-main dark:text-white">Our Journey</h2>
          </div>
          <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">Timeline View</span>
        </div>

        {sortedMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center">
            <div className="size-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-4xl text-primary">photo_camera</span>
            </div>
            <p className="text-sm font-display italic px-10 leading-relaxed">No shared memories yet. Every story needs a beginning—capture yours today.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {sortedMemories.map((memory, idx) => (
              <div 
                key={memory.id} 
                onClick={() => onSelectMemory(memory)}
                className="relative pl-12 before:absolute before:left-4 before:top-4 before:bottom-[-48px] before:w-[2px] before:bg-gradient-to-b before:from-primary/30 before:to-primary/5 last:before:hidden cursor-pointer group"
              >
                <div className="absolute left-0 top-1.5 size-8 rounded-full bg-background-light dark:bg-background-dark border-2 border-primary/20 flex items-center justify-center z-10 group-hover:border-primary transition-all shadow-sm">
                  <div className="size-2.5 rounded-full bg-primary group-hover:scale-125 transition-transform" />
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-text-muted/70 dark:text-gray-500">{memory.date}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-[11px] font-medium text-text-muted/60 uppercase">{memory.time}</span>
                    </div>
                    {memory.isHighlight && (
                      <span className="material-symbols-outlined text-amber-400 text-xl fill">star</span>
                    )}
                  </div>
                  
                  <div className="bg-white dark:bg-card-dark rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-xl transition-all border border-primary/5 dark:border-white/5 active:scale-[0.98]">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={memory.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={memory.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                           <span className="material-symbols-outlined text-sm">visibility</span>
                           View Detail
                        </span>
                      </div>
                    </div>
                    <div className="p-7">
                      <h3 className="font-bold font-display text-2xl text-text-main dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors">{memory.title}</h3>
                      <p className="text-base text-text-main/70 dark:text-gray-400 line-clamp-3 mt-3 font-news italic leading-relaxed">
                        "{memory.content}"
                      </p>
                      <div className="flex items-center justify-between mt-6">
                        {!hideLocations && (
                          <div className="flex items-center text-[10px] text-teal-accent font-bold uppercase tracking-widest bg-teal-accent/5 px-3 py-1.5 rounded-full">
                             <span className="material-symbols-outlined text-sm mr-1.5">location_on</span>
                             {memory.location}
                          </div>
                        )}
                        <div className="flex items-center text-[10px] text-primary/80 font-bold uppercase tracking-widest">
                           {memory.mood}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PersonDetail;
