
import React from 'react';
import { Memory } from '../types';

interface MapExplorerProps {
  memories: Memory[];
  onBack: () => void;
  onSelectMemory: (memory: Memory) => void;
  hideLocations: boolean;
}

const MapExplorer: React.FC<MapExplorerProps> = ({ memories, onBack, onSelectMemory, hideLocations }) => {
  // Filter memories that actually have coordinates
  const mappedMemories = hideLocations ? [] : memories.filter(m => m.coordinates);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      <nav className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
        <button onClick={onBack} className="size-10 bg-white/90 dark:bg-card-dark/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-text-main dark:text-white transition-transform active:scale-90">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="bg-white/90 dark:bg-card-dark/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-accent text-lg">explore</span>
          <span className="text-sm font-bold font-display dark:text-white">Spatial Memory</span>
        </div>
        <div className="size-10" />
      </nav>

      {/* Simulated Map Background */}
      <div className="relative flex-1 bg-gray-200 dark:bg-background-dark overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        {/* Memory Markers */}
        {mappedMemories.length > 0 ? (
          mappedMemories.map((memory, index) => {
            // Since we don't have a real map library like Leaflet/Google Maps here to keep it simple,
            // we'll spread them out visually based on their index but simulate real markers.
            const offsetTop = (index * 15) % 60 + 20;
            const offsetLeft = (index * 25) % 70 + 15;
            
            return (
              <div 
                key={memory.id}
                style={{ top: `${offsetTop}%`, left: `${offsetLeft}%` }}
                className="absolute group cursor-pointer z-10 animate-in zoom-in duration-500" 
                onClick={() => onSelectMemory(memory)}
              >
                <div className="relative">
                  <div className={`size-16 rounded-full border-4 ${memory.isHighlight ? 'border-amber-400' : 'border-white'} shadow-xl overflow-hidden group-hover:scale-125 transition-transform duration-300 ring-4 ring-black/5`}>
                    <img src={memory.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/80 dark:text-white px-2 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-bold border border-black/5">
                    {hideLocations ? 'Location Hidden' : memory.location}
                  </div>
                  {/* Small pointer tail */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white dark:border-t-black/80 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted opacity-60 text-center px-10 gap-4">
            <span className="material-symbols-outlined text-5xl">location_off</span>
            <p className="text-sm italic font-display">
              {hideLocations ? 'Locations are hidden by Privacy settings.' : 'No geotagged memories found.'}
              <br />
              {hideLocations ? 'Turn off Hide Locations to use the map.' : 'Enable location when capturing to see your map grow.'}
            </p>
          </div>
        )}

        {/* User Pulsing Location Marker (Center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
          <div className="size-12 bg-teal-accent/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="size-5 bg-teal-accent rounded-full border-2 border-white shadow-lg" />
          </div>
        </div>
      </div>

      <div className="bg-white/95 dark:bg-card-dark/95 backdrop-blur-xl border-t border-black/5 p-6 z-20">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-4">Journey Nodes</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {memories.length > 0 ? (
            memories.map(m => (
              <div 
                key={m.id} 
                onClick={() => onSelectMemory(m)}
                className="flex-shrink-0 w-44 bg-background-light dark:bg-background-dark rounded-xl p-2 flex items-center gap-3 shadow-sm border border-black/[0.03] cursor-pointer active:scale-95 transition-transform"
              >
                <img src={m.imageUrl} className="size-10 rounded-lg object-cover" alt="" />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[11px] font-bold text-text-main dark:text-white truncate">{m.title}</span>
                  <span className="text-[9px] text-text-muted truncate">{hideLocations ? 'Location Hidden' : m.location}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-text-muted py-2 px-4 italic">Memories will appear here once captured.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;
