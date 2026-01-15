
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Memory, Person } from '../types';
import { getMoodInsights } from '../services/promptService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';

interface InsightsProps {
  memories: Memory[];
  people: Person[];
}

const COLORS = ['#a14573', '#287b78', '#f59e0b', '#6366f1', '#ef4444', '#10b981', '#8b5cf6'];

const parseMemoryDate = (value: string | undefined) => {
  if (!value) return null;
  const trimmed = value.trim();
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const dmy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    const d = new Date(year, month - 1, day);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const first = payload[0];
  const rawName = first?.payload?.name ?? label ?? first?.name ?? '';
  const name = first?.name === 'count' && label ? label : rawName;
  const value = first?.value ?? first?.payload?.value ?? first?.payload?.count;
  const total = payload?.[0]?.payload?.__total;
  const percent = typeof total === 'number' && typeof value === 'number' && total > 0 ? Math.round((value / total) * 100) : null;
  const unit = first?.name === 'count' ? 'moments' : null;

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-card-dark/95 backdrop-blur px-3 py-2 shadow-lg">
      <div className="text-[11px] font-bold text-text-main dark:text-white truncate max-w-[180px]">{String(name)}</div>
      <div className="mt-0.5 flex items-baseline gap-2">
        <div className="text-sm font-bold text-primary">{value}{unit ? <span className="ml-1 text-[11px] font-semibold text-text-muted dark:text-gray-400">{unit}</span> : null}</div>
        {percent !== null && <div className="text-[11px] font-semibold text-text-muted dark:text-gray-400">{percent}%</div>}
      </div>
    </div>
  );
};

const MoodBreakdown = ({ data, total }: { data: Array<{ name: string; value: number }>; total: number }) => {
  return (
    <div className="w-full space-y-2">
      {data.map((entry, index) => {
        const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
        return (
          <div key={entry.name} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-text-main dark:text-white truncate">{entry.name}</div>
                <div className="text-[11px] font-bold text-text-muted dark:text-gray-400 shrink-0">
                  {entry.value} · {pct}%
                </div>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[index % COLORS.length] }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Insights: React.FC<InsightsProps> = ({ memories, people }) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | '30days' | '7days'>('all');
  const requestSeq = useRef(0);

  const [aiData, setAiData] = useState({
    theme: "Analyzing...",
    insight: "Gathering your moments to reflect.",
    digest: "Your emotional story is being written...",
    tags: ["#Loading", "#Mindful"],
    quote: "Every moment is a fresh beginning."
  });
  const [loading, setLoading] = useState(true);

  const filteredMemories = useMemo(() => {
    let filtered = [...memories];

    if (selectedPersonId !== 'all') {
      filtered = filtered.filter(m => m.peopleIds && m.peopleIds.includes(selectedPersonId));
    }

    if (timeFilter === '30days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      filtered = filtered.filter(m => {
        const d = parseMemoryDate(m.date);
        if (!d) return true;
        return d >= cutoff;
      });
    } else if (timeFilter === '7days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      filtered = filtered.filter(m => {
        const d = parseMemoryDate(m.date);
        if (!d) return true;
        return d >= cutoff;
      });
    }

    return filtered;
  }, [memories, selectedPersonId, timeFilter]);

  const stats = useMemo(() => {
    if (filteredMemories.length === 0) return { topMood: 'N/A', count: 0, streak: 0, highlights: [], moodData: [], activityData: [] };

    const moodCounts = filteredMemories.reduce((acc: any, m) => {
      acc[m.mood] = (acc[m.mood] || 0) + 1;
      return acc;
    }, {});

    const moodDataUnsorted = Object.entries(moodCounts).map(([name, value]) => ({ name, value: Number(value) }));
    const moodData = [...moodDataUnsorted].sort((a: any, b: any) => b.value - a.value);
    const topMood = moodData[0]?.name || 'N/A';

    const activityMap = new Map<string, { key: string; label: string; count: number }>();
    for (const m of filteredMemories) {
      const d = parseMemoryDate(m.date);
      if (!d) continue;
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = activityMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        activityMap.set(key, { key, label, count: 1 });
      }
    }

    const activityData = [...activityMap.values()]
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-7)
      .map(({ label, count }) => ({ date: label, count }));

    const streak = Math.min(activityData.length, 7);
    const highlights = filteredMemories
      .filter(m => m.isHighlight)
      .sort((a, b) => {
        const da = parseMemoryDate(a.date)?.getTime() ?? -Infinity;
        const db = parseMemoryDate(b.date)?.getTime() ?? -Infinity;
        return db - da;
      })
      .slice(0, 3);

    return { topMood, count: filteredMemories.length, streak, highlights, moodData, activityData };
  }, [filteredMemories]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (filteredMemories.length === 0) {
        setLoading(false);
        setAiData({
          theme: "No Data",
          insight: "Add more memories to see insights.",
          digest: "Start capturing your moments.",
          tags: [],
          quote: "Every journey begins with a single step."
        });
        return;
      }

      const seq = ++requestSeq.current;
      setLoading(true);
      const simplified = [...filteredMemories]
        .sort((a, b) => {
          const da = parseMemoryDate(a.date)?.getTime() ?? -Infinity;
          const db = parseMemoryDate(b.date)?.getTime() ?? -Infinity;
          return db - da;
        })
        .slice(0, 15)
        .map(m => {
          const parsedDate = parseMemoryDate(m.date);
          return {
            content: m.content,
            mood: m.mood,
            date: parsedDate ? parsedDate.toISOString() : undefined
          };
        });
      const result = await getMoodInsights(simplified);
      if (seq !== requestSeq.current) return;
      setAiData(result);
      setLoading(false);
    };

    fetchInsights();
    return () => {
      requestSeq.current += 1;
    };
  }, [filteredMemories]);

  const isDark = document.documentElement.classList.contains('dark');
  const axisTickColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <header className="px-6 py-8 pt-12">
        <h1 className="text-3xl font-bold tracking-tight text-text-main dark:text-white font-jakarta">Insights</h1>
        <p className="text-sm text-text-muted dark:text-gray-400 mt-1 font-medium">Your digital soul, analyzed.</p>
      </header>

      {/* Filters Section */}
      <section className="px-6 mb-6">
        <div className="flex flex-col gap-4">
          {/* Person Filter */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setSelectedPersonId('all')}
              className={`flex flex-col items-center gap-1 min-w-[60px] ${selectedPersonId === 'all' ? 'opacity-100' : 'opacity-50'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${selectedPersonId === 'all' ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5'}`}>
                <span className="material-symbols-outlined text-xl">groups</span>
              </div>
              <span className="text-[10px] font-bold">Everyone</span>
            </button>
            {people.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPersonId(p.id)}
                className={`flex flex-col items-center gap-1 min-w-[60px] ${selectedPersonId === p.id ? 'opacity-100' : 'opacity-50'}`}
              >
                <img src={p.imageUrl} alt={p.name} className={`w-12 h-12 rounded-full object-cover border-2 ${selectedPersonId === p.id ? 'border-primary' : 'border-transparent'}`} />
                <span className="text-[10px] font-bold truncate max-w-[60px]">{p.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Time Filter */}
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl self-start">
            {[
              { id: 'all', label: 'All Time' },
              { id: '30days', label: '30 Days' },
              { id: '7days', label: '7 Days' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === f.id ? 'bg-white dark:bg-card-dark shadow-sm text-primary' : 'text-text-muted hover:text-text-main'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI Digest Section */}
      <section className="px-6 mb-8">
        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-8 shadow-soft relative overflow-hidden border border-primary/5 dark:border-white/5">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <span className="material-symbols-outlined text-8xl text-primary">auto_awesome</span>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className={`material-symbols-outlined text-teal-accent text-xl ${loading ? 'animate-pulse' : ''}`}>spa</span>
              <p className="text-teal-accent text-[11px] font-bold uppercase tracking-[0.2em]">Memories Digest</p>
            </div>

            <h2 className={`text-2xl font-news font-bold text-text-main dark:text-white tracking-tight leading-tight mb-4 ${loading ? 'opacity-40 animate-pulse' : ''}`}>
              {aiData.theme}
            </h2>

            <p className={`text-base font-serif italic text-text-main/80 dark:text-gray-300 leading-relaxed mb-6 ${loading ? 'opacity-40 animate-pulse' : ''}`}>
              "{aiData.digest}"
            </p>

            <div className="flex flex-wrap gap-2">
              {aiData.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary-light text-[10px] font-bold rounded-full border border-primary/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {filteredMemories.length === 0 ? (
        <div className="px-6 text-center py-10">
          <p className="text-text-muted">No memories found for this selection.</p>
        </div>
      ) : (
        <>
          {/* Pattern Recognition & Stats */}
          <section className="px-6 mb-8 grid grid-cols-2 gap-4">
            {/* Mood Distribution Chart */}
            <div className="bg-white dark:bg-card-dark p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-whisper col-span-2">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Mood Overview</div>
                  <div className="mt-1 text-sm font-bold text-text-main dark:text-white font-jakarta truncate">How you’ve been feeling</div>
                </div>
                <div className="shrink-0 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-[11px] font-bold">
                  {stats.count} moments
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="w-full max-w-[280px] mx-auto">
                  <div className="relative h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.moodData.map((d: any) => ({ ...d, __total: stats.count }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={68}
                          outerRadius={98}
                          paddingAngle={3}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          stroke="transparent"
                          cornerRadius={10}
                          isAnimationActive
                        >
                          {stats.moodData.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Top Mood</div>
                      <div className="mt-1 text-lg font-display font-bold text-text-main dark:text-white max-w-[160px] truncate">
                        {stats.topMood}
                      </div>
                    </div>
                  </div>
                </div>

                <MoodBreakdown data={stats.moodData as any} total={stats.count} />
              </div>
            </div>

            <div className="bg-white dark:bg-card-dark p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-whisper">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-amber-500 text-xl">mood</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Top Mood</span>
              </div>
              <p className="text-xl font-display font-bold text-text-main dark:text-white truncate">{stats.topMood}</p>
              <div className="mt-2 text-xs text-text-muted">
                Most frequent in selection
              </div>
            </div>

            <div className="bg-white dark:bg-card-dark p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-whisper">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-teal-accent text-xl">history</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Count</span>
              </div>
              <p className="text-2xl font-display font-bold text-text-main dark:text-white">{stats.count}</p>
              <div className="mt-2 text-xs text-text-muted">
                Memories found
              </div>
            </div>

            {/* Activity Chart */}
            <div className="col-span-2 bg-white dark:bg-card-dark p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-whisper">
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-text-main dark:text-white font-jakarta">Moment Frequency</h3>
                  <p className="text-[10px] text-text-muted font-medium">Timeline of selected memories</p>
                </div>
                <span className="material-symbols-outlined text-primary/50">monitoring</span>
              </div>
              {stats.activityData.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-sm font-semibold text-text-main dark:text-white">Not enough timeline data</div>
                  <div className="mt-1 text-xs text-text-muted">Add dates to memories to see frequency</div>
                </div>
              ) : (
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(stats.activityData as any).map((d: any) => ({ ...d, __total: stats.count }))}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      barCategoryGap="22%"
                      barGap={6}
                    >
                      <defs>
                        <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a14573" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#287b78" stopOpacity={0.75} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke={isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.08)'} strokeDasharray="4 4" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: axisTickColor }} axisLine={false} tickLine={false} minTickGap={12} />
                      <YAxis allowDecimals={false} tick={false} axisLine={false} tickLine={false} width={0} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} content={<ChartTooltip />} />
                      <Bar dataKey="count" fill="url(#activityGradient)" radius={[10, 10, 10, 10]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          {/* Highlights Gallery */}
          <section className="px-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-main dark:text-white font-display">Highlights</h3>
              <span className="material-symbols-outlined text-primary text-xl">star</span>
            </div>

            <div className="space-y-6">
              {stats.highlights.length > 0 ? stats.highlights.map(memory => (
                <div key={memory.id} className="bg-white dark:bg-card-dark rounded-3xl overflow-hidden shadow-soft border border-black/5 dark:border-white/5 group">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img src={memory.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <p className="text-white text-xs font-bold uppercase tracking-widest">{memory.date}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary text-sm">format_quote</span>
                      <h4 className="text-base font-bold text-text-main dark:text-white font-display">{memory.title}</h4>
                    </div>
                    <p className="text-sm text-text-muted italic leading-relaxed font-serif">
                      "{memory.content.substring(0, 80)}..."
                    </p>
                  </div>
                </div>
              )) : (
                <div className="p-8 border-2 border-dashed border-primary/10 rounded-3xl text-center">
                  <p className="text-xs text-text-muted italic">No highlights in this selection.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Wisdom Quote */}
      <section className="px-6 pb-4">
        <div className="p-8 bg-teal-accent/5 dark:bg-teal-accent/10 rounded-[2rem] border border-teal-accent/10 flex flex-col items-center text-center gap-4">
          <div className="size-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-teal-accent">format_quote</span>
          </div>
          <div className={`space-y-2 ${loading ? 'opacity-40 animate-pulse' : ''}`}>
            <p className="text-lg font-serif italic text-text-main dark:text-gray-200">
              "{aiData.quote}"
            </p>
            <p className="text-[10px] font-bold text-teal-accent uppercase tracking-widest">— Your Inner Voice</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Insights;
