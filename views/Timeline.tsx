
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory, View } from '../types';

interface TimelineProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
  onNavigate: (view: View) => void;
  hideLocations: boolean;
}

type TimeTab = 'Day' | 'Week' | 'Month' | 'All';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Timeline: React.FC<TimelineProps> = ({ memories, onSelectMemory, onNavigate, hideLocations }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TimeTab>('All');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  
  // Helper to parse "Oct 24, 2024" to Date object
  const parseDate = (dateStr: string) => new Date(dateStr);

  const parseISODateLocal = (value: string) => {
    const [yearRaw, monthRaw, dayRaw] = value.split('-');
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return new Date(NaN);
    return new Date(year, month - 1, day);
  };

  const formatISODateLocal = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const dayOfWeekSundayZero = firstDayOfMonth.getDay();
    const mondayZeroOffset = (dayOfWeekSundayZero + 6) % 7;
    const start = new Date(firstDayOfMonth);
    start.setDate(firstDayOfMonth.getDate() - mondayZeroOffset);

    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({ date: d, inMonth: d.getMonth() === calendarMonth.getMonth() });
    }
    return days;
  }, [calendarMonth]);

  useEffect(() => {
    if (!showDatePicker) return;
    const base = selectedDate ? parseISODateLocal(selectedDate) : new Date();
    if (Number.isNaN(base.getTime())) {
      setCalendarMonth(new Date());
      return;
    }
    setCalendarMonth(new Date(base.getFullYear(), base.getMonth(), 1));
  }, [selectedDate, showDatePicker]);

  const filteredMemories = useMemo(() => {
    let filtered = memories;
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Apply Time Tab Filter
    if (activeTab === 'Day') {
      filtered = filtered.filter(m => m.date === todayStr);
    } else if (activeTab === 'Week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(m => parseDate(m.date) >= oneWeekAgo);
    } else if (activeTab === 'Month') {
      filtered = filtered.filter(m => {
        const d = parseDate(m.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    // Apply Custom Date Filter
    if (selectedDate) {
      const filterDate = parseISODateLocal(selectedDate);
      filtered = filtered.filter(m => {
        const d = parseDate(m.date);
        return d.getDate() === filterDate.getDate() && 
               d.getMonth() === filterDate.getMonth() && 
               d.getFullYear() === filterDate.getFullYear();
      });
    }

    // Apply Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(query) || 
        m.content.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
  }, [memories, searchQuery, activeTab, selectedDate]);

  // Group memories by Month-Year for the "All" tab or when listing many items
  const groupedMemories = useMemo(() => {
    const groups: { [key: string]: Memory[] } = {};
    filteredMemories.forEach(memory => {
      const date = parseDate(memory.date);
      const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(memory);
    });
    return groups;
  }, [filteredMemories]);

  const highlights = useMemo(() => filteredMemories.filter(m => m.isHighlight), [filteredMemories]);
  const normalEntries = useMemo(() => filteredMemories.filter(m => !m.isHighlight), [filteredMemories]);
  
  const headerDate = selectedDate ? parseISODateLocal(selectedDate) : new Date();
  const headerDateLabel = headerDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const headerDayName = headerDate.toLocaleDateString('en-US', { weekday: 'long' });

  const handleMemoryClick = (memory: Memory) => {
    if (memory.isCapsule && memory.unlockDate) {
      const unlockDate = new Date(memory.unlockDate);
      const now = new Date();
      if (unlockDate > now) {
        alert(`This Time Capsule is locked until ${unlockDate.toLocaleDateString()}`);
        return;
      }
    }
    onSelectMemory(memory);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="px-6 pt-12 pb-4 sticky top-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm z-30 transition-all border-b border-primary/5">
        <div className="flex items-end justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-text-muted dark:text-gray-400 text-xs tracking-widest uppercase font-medium mb-1">Timeline</span>
            <div className="flex items-center gap-2">
              <div className="flex flex-col leading-none">
                <h1 className="text-3xl font-bold text-primary dark:text-gray-100 font-display">{headerDateLabel}</h1>
                <span className="mt-1 text-[11px] font-semibold text-text-muted dark:text-gray-400">{headerDayName}</span>
              </div>
              <button 
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                }}
                className={`p-1.5 rounded-full transition-colors ${showDatePicker || selectedDate ? 'bg-primary text-white' : 'hover:bg-primary/5 text-primary'}`}
              >
                <span className="material-symbols-outlined text-xl">calendar_month</span>
              </button>
            </div>
          </div>
          <button onClick={() => onNavigate('profile')} className="p-2 rounded-full hover:bg-primary/5 text-primary">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {/* Date Picker Input */}
        <AnimatePresence>
          {showDatePicker && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="w-full rounded-2xl border border-primary/10 dark:border-white/10 bg-white dark:bg-card-dark shadow-whisper overflow-hidden">
                <div className="flex items-center justify-between px-3 py-3">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                    className="p-2 rounded-xl hover:bg-primary/5 dark:hover:bg-white/5 text-text-main dark:text-white"
                    aria-label="Previous month"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>

                  <div className="flex flex-col items-center">
                    <div className="text-sm font-bold text-text-main dark:text-white font-display">
                      {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    {selectedDate ? (
                      <div className="mt-0.5 text-[11px] font-semibold text-primary">
                        {parseISODateLocal(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    ) : (
                      <div className="mt-0.5 text-[11px] font-semibold text-text-muted dark:text-gray-400">Select a day</div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                    className="p-2 rounded-xl hover:bg-primary/5 dark:hover:bg-white/5 text-text-main dark:text-white"
                    aria-label="Next month"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>

                <div className="px-3 pb-3">
                  <div className="grid grid-cols-7 gap-1">
                    {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((label) => (
                      <div
                        key={label}
                        className="h-7 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-400"
                      >
                        {label}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map(({ date, inMonth }) => {
                      const today = new Date();
                      const selected = selectedDate ? parseISODateLocal(selectedDate) : null;
                      const isSelected = selected ? isSameDay(date, selected) : false;
                      const isToday = isSameDay(date, today);

                      return (
                        <button
                          key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                          type="button"
                          onClick={() => {
                            setSelectedDate(formatISODateLocal(date));
                            setActiveTab('All');
                            setShowDatePicker(false);
                          }}
                          className={[
                            'h-10 rounded-xl text-sm font-semibold transition-colors font-jakarta',
                            inMonth ? 'text-text-main dark:text-white' : 'text-text-muted/40 dark:text-gray-500',
                            isSelected ? 'bg-primary text-white' : 'hover:bg-primary/5 dark:hover:bg-white/5',
                            !isSelected && isToday ? 'ring-1 ring-primary/40' : '',
                          ].join(' ')}
                          aria-label={date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setSelectedDate(formatISODateLocal(now));
                        setActiveTab('All');
                        setShowDatePicker(false);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs uppercase tracking-wider"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate('');
                        setActiveTab('All');
                        setShowDatePicker(false);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-text-main dark:text-white font-bold text-xs uppercase tracking-wider"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        <div className="relative group mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-lg group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full bg-white dark:bg-card-dark border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-jakarta shadow-whisper focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted/40"
          />
        </div>

        {/* View Tabs */}
        <div className="flex bg-primary/5 dark:bg-white/5 p-1 rounded-xl">
          {(['Day', 'Week', 'Month', 'All'] as TimeTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === tab 
                ? 'bg-white dark:bg-primary shadow-sm text-primary dark:text-white' 
                : 'text-text-muted/60 dark:text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 px-6 pt-4">
        {activeTab === 'All' && highlights.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary/70">history_edu</span>
              <h2 className="text-lg font-bold text-text-main dark:text-gray-100 font-display">Highlights</h2>
            </div>
            <div className="flex overflow-x-auto gap-4 no-scrollbar -mx-2 px-2">
              {highlights.map(memory => (
                <div 
                  key={memory.id}
                  onClick={() => onSelectMemory(memory)}
                className="min-w-[280px] w-[280px] shrink-0 overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-soft border border-primary/5 dark:border-white/5 cursor-pointer transform transition-all active:scale-[0.98]"
              >
                <div className="relative aspect-video">
                    <img src={memory.imageUrl} className="w-full h-full object-cover" alt={memory.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{memory.date}</p>
                      <h3 className="text-lg font-bold font-display truncate">{memory.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-6">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-xl font-bold text-text-main dark:text-gray-100 font-display">
              {searchQuery ? `Search: ${searchQuery}` : `${activeTab} View`}
            </h2>
            <span className="text-[10px] font-bold text-text-muted/50 uppercase tracking-tighter">
              {filteredMemories.length} Moments
            </span>
          </div>

          {filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <span className="material-symbols-outlined text-4xl mb-2">
                {searchQuery ? 'search_off' : 'event_note'}
              </span>
              <p className="text-sm font-display px-10">
                {searchQuery 
                  ? `No results found for "${searchQuery}"` 
                  : `No memories found in this ${activeTab.toLowerCase()} range.`}
              </p>
              <button 
                onClick={() => onNavigate('capture')} 
                className="mt-4 text-primary font-bold uppercase text-xs border-b border-primary/20 pb-0.5"
              >
                Capture one now
              </button>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-8 relative"
            >
               {/* Vertical Line Background */}
               <div className="absolute left-4 sm:left-[19px] top-2 bottom-0 w-[2px] bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />

              {Object.entries(groupedMemories).map(([groupLabel, groupMemories]: [string, Memory[]]) => (
                <div key={groupLabel} className="relative">
                  {/* Month Header */}
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 z-10 border-4 border-background-light dark:border-background-dark">
                        <span className="material-symbols-outlined text-primary text-base sm:text-xl">calendar_month</span>
                     </div>
                     <h3 className="text-xs sm:text-sm font-bold text-primary/80 uppercase tracking-widest bg-background-light dark:bg-background-dark pr-4">
                        {groupLabel}
                     </h3>
                  </div>

                  <div className="space-y-4 pl-10 sm:pl-12">
                    {groupMemories.map((memory) => {
                      const isLocked = memory.isCapsule && memory.unlockDate && new Date(memory.unlockDate) > new Date();
                      return (
                      <motion.article 
                        variants={itemVariants}
                        key={memory.id} 
                        onClick={() => handleMemoryClick(memory)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative flex gap-4 p-3 bg-white dark:bg-card-dark rounded-2xl shadow-whisper border border-transparent hover:border-primary/10 dark:hover:border-white/10 transition-all cursor-pointer z-10"
                      >
                         {/* Connector Dot */}
                         <div className="absolute -left-[29px] sm:-left-[35px] top-8 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white dark:bg-card-dark border-2 border-primary group-hover:scale-125 transition-transform" />
                         
                        <div className="w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5">
                          {isLocked ? (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined text-2xl">lock</span>
                            </div>
                          ) : (
                            <img src={memory.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          )}
                        </div>
                        <div className="flex flex-col justify-center flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">{memory.date}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] text-text-muted font-medium">{memory.time}</span>
                            {memory.isCapsule && (
                              <span className="material-symbols-outlined text-amber-500 text-[14px] ml-auto">hourglass_top</span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-text-main dark:text-white truncate font-display mb-1">
                            {isLocked ? 'Time Capsule' : memory.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-0.5 rounded-full bg-teal-accent/10 border border-teal-accent/5">
                              <span className="text-[9px] font-bold text-teal-accent uppercase">{isLocked ? 'LOCKED' : memory.mood}</span>
                            </div>
                            {!isLocked && (
                              <span className="text-[10px] text-text-muted truncate max-w-[120px]">
                                <span className="material-symbols-outlined text-[12px] align-middle mr-1">
                                  {hideLocations ? 'location_off' : 'location_on'}
                                </span>
                                {hideLocations ? 'Location Hidden' : memory.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    )})}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Timeline;
