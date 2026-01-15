
import React, { useMemo } from 'react';
import { Person, Memory, View } from '../types';

interface PeopleProps {
  people: Person[];
  memories: Memory[];
  onNavigate: (view: View) => void;
  onSelectPerson: (id: string) => void;
  onAddPerson: () => void;
}

const People: React.FC<PeopleProps> = ({ people, memories, onNavigate, onSelectPerson, onAddPerson }) => {
  const peopleWithCounts = useMemo(() => {
    return people.map(person => ({
      ...person,
      dynamicCount: memories.filter(m => m.peopleIds.includes(person.id)).length
    })).sort((a, b) => b.dynamicCount - a.dynamicCount);
  }, [people, memories]);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      <header className="flex flex-col px-6 pt-12 pb-6 shrink-0 bg-white/40 dark:bg-background-dark/40 backdrop-blur-md border-b border-primary/5 sticky top-0 z-30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-text-main dark:text-white font-jakarta">Inner Circle</h1>
          <button 
            onClick={onAddPerson}
            aria-label="Add new person"
            className="size-10 bg-primary/10 text-primary dark:text-primary-light rounded-full flex items-center justify-center hover:bg-primary/20 transition-all active:scale-90 shadow-sm"
          >
            <span className="material-symbols-outlined">person_add</span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted dark:text-gray-400 font-medium">Shared journeys and kindred souls.</p>
          <span className="text-[10px] font-bold text-primary/40 dark:text-primary/60 uppercase tracking-widest">{people.length} People</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 pt-6">
        <div className="flex flex-col gap-4">
          {peopleWithCounts.length > 0 ? (
            peopleWithCounts.map(person => (
              <div 
                key={person.id}
                onClick={() => onSelectPerson(person.id)}
                className="group relative flex items-center justify-between p-4 bg-white dark:bg-card-dark rounded-[1.8rem] shadow-whisper hover:shadow-lg transition-all cursor-pointer border border-primary/5 dark:border-white/5 hover:border-primary/20 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full h-16 w-16 shadow-inner ring-4 ring-primary/5 dark:ring-white/5 p-0.5 overflow-hidden transition-transform group-hover:scale-105" style={{ backgroundImage: `url("${person.imageUrl}")` }}>
                      <img src={person.imageUrl} className="w-full h-full object-cover opacity-0" alt="" />
                    </div>
                    {person.dynamicCount >= 3 && (
                      <div className="absolute -top-1 -right-1 size-6 bg-teal-accent rounded-full flex items-center justify-center border-2 border-white dark:border-card-dark shadow-sm">
                        <span className="material-symbols-outlined text-white text-[11px] fill">favorite</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-text-main dark:text-white text-lg font-bold leading-tight font-display mb-0.5 group-hover:text-primary transition-colors">{person.name}</h3>
                    <span className="text-text-muted dark:text-gray-400 text-xs font-sans font-medium">{person.role}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${person.dynamicCount > 0 ? 'bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary-light' : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-400'}`}>
                    {person.dynamicCount} Moments
                  </div>
                  <span className="material-symbols-outlined text-primary/30 text-xl group-hover:translate-x-1 transition-transform group-hover:text-primary">chevron_right</span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <span className="material-symbols-outlined text-6xl text-primary mb-4">group_off</span>
              <p className="text-sm font-display px-10 italic leading-relaxed">Your inner circle is the heart of your sanctuary. Start by adding someone special.</p>
            </div>
          )}

          <div 
            onClick={onAddPerson}
            className="group relative flex flex-col items-center justify-center p-8 bg-dashed bg-white/30 dark:bg-card-dark/30 rounded-[1.8rem] border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all cursor-pointer mt-2 overflow-hidden shadow-sm"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="size-14 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">add_circle</span>
              </div>
              <h3 className="text-text-main dark:text-white font-bold font-display text-lg">Add to Circle</h3>
              <p className="text-xs text-text-muted dark:text-gray-400 mt-1 font-medium">Record shared history together</p>
            </div>
          </div>
        </div>

        <div className="mt-16 mb-8 text-center px-10">
          <div className="flex justify-center gap-1 mb-4 opacity-20">
            <span className="material-symbols-outlined text-xl">favorite</span>
            <span className="material-symbols-outlined text-xl">favorite</span>
            <span className="material-symbols-outlined text-xl">favorite</span>
          </div>
          <p className="text-xs text-text-muted dark:text-gray-500 font-news italic leading-relaxed">
            "We are the sum of our connections. Each person in our circle reflects a part of our soul's landscape."
          </p>
        </div>
      </main>
    </div>
  );
};

export default People;
