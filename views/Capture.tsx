
import React, { useState, useRef, useEffect } from 'react';
import { Person, Memory } from '../types';
import { getRandomPrompt } from '../services/promptService';
import AudioRecorder from '../components/AudioRecorder';

interface CaptureProps {
  people: Person[];
  editingMemory: Memory | null;
  onSave: (memory: Memory) => void;
  onCancel: () => void;
  hideLocations: boolean;
}

const moods = [
  { icon: 'sunny', name: 'Joyful' },
  { icon: 'cloud', name: 'Calm' },
  { icon: 'foggy', name: 'Peaceful' },
  { icon: 'water_drop', name: 'Pensive' },
  { icon: 'air', name: 'Dynamic' }
];

const Capture: React.FC<CaptureProps> = ({ people, editingMemory, onSave, onCancel, hideLocations }) => {
  const [reflection, setReflection] = useState(editingMemory?.content || '');
  const [selectedMood, setSelectedMood] = useState(editingMemory?.mood || 'Calm');
  const [selectedPeople, setSelectedPeople] = useState<string[]>(editingMemory?.peopleIds || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHighlight, setIsHighlight] = useState(editingMemory?.isHighlight || false);
  const [imageUrl, setImageUrl] = useState(editingMemory?.imageUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1000');
  const [location, setLocation] = useState(editingMemory?.location || 'Detecting...');
  const [coords, setCoords] = useState<{ lat: number, lng: number } | undefined>(editingMemory?.coordinates);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(editingMemory?.audioUrl);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(editingMemory?.audioDuration);
  const [isCapsule, setIsCapsule] = useState<boolean>(editingMemory?.isCapsule || false);
  const [unlockDate, setUnlockDate] = useState<string>(editingMemory?.unlockDate || '');

  // Camera States
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (hideLocations) {
      setCoords(undefined);
      setLocation('Location Private');
      return;
    }

    if (!editingMemory && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          // Offline mode: Use coordinates or generic text instead of reverse geocoding
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => setLocation('Location Private')
      );
    }
  }, [editingMemory, hideLocations]);

  // Handle camera start/stop
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Please allow camera access to take photos.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Create square crop
        const size = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = size;
        canvas.height = size;

        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;

        context.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImageUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const handleTogglePerson = (id: string) => {
    setSelectedPeople(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomPrompt = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    const caption = await getRandomPrompt();
    setReflection(caption || "");
    setIsGenerating(false);
  };

  const handleSubmit = () => {
    if (!reflection.trim()) return;

    const safeLocation = hideLocations ? 'Location Private' : location;
    const safeCoords = hideLocations ? undefined : coords;

    const newMemory: Memory = {
      id: editingMemory?.id || Date.now().toString(),
      title: editingMemory?.title || (reflection.split(' ').slice(0, 4).join(' ').replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") || "New Moment"),
      date: editingMemory?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: editingMemory?.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      location: safeLocation,
      mood: selectedMood,
      content: reflection,
      imageUrl: imageUrl,
      audioUrl,
      audioDuration,
      peopleIds: selectedPeople,
      isHighlight: isHighlight,
      coordinates: safeCoords,
      isCapsule,
      unlockDate: isCapsule ? unlockDate : undefined
    };
    onSave(newMemory);
  };

  return (
    <div className="flex h-full flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar relative">
      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Fullscreen Camera Overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between py-12 px-6">
          <div className="w-full flex justify-between items-center text-white">
            <button onClick={stopCamera} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
              <span className="material-symbols-outlined">close</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Live Capture</span>
            <div className="w-10" />
          </div>

          <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Camera Guides */}
            <div className="absolute inset-0 pointer-events-none border border-white/20 m-8 rounded-2xl" />
          </div>

          <div className="w-full flex items-center justify-around">
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1.5 opacity-60">
              <span className="material-symbols-outlined text-white">photo_library</span>
              <span className="text-[10px] text-white uppercase font-bold">Gallery</span>
            </button>

            <button
              onClick={capturePhoto}
              className="size-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform"
            >
              <div className="size-16 bg-white rounded-full group-hover:scale-90 transition-transform" />
            </button>

            <button className="flex flex-col items-center gap-1.5 opacity-60">
              <span className="material-symbols-outlined text-white">flip_camera_ios</span>
              <span className="text-[10px] text-white uppercase font-bold">Flip</span>
            </button>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-6 pt-12 pb-4 bg-transparent z-20">
        <button onClick={onCancel} className="text-text-muted hover:text-text-main dark:text-gray-400 dark:hover:text-white text-sm font-medium">Cancel</button>
        <div className="flex flex-col items-center">
          <h2 className="text-text-main dark:text-white text-xs font-bold tracking-widest uppercase">{editingMemory ? 'Edit Memory' : 'Capture'}</h2>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!reflection.trim() || isGenerating}
          className={`text-sm font-bold transition-colors ${reflection.trim() && !isGenerating ? 'text-teal-accent' : 'text-gray-300'}`}
        >
          {editingMemory ? 'Update' : 'Save'}
        </button>
      </header>

      <main className="flex-1 px-6 pb-32 overflow-y-auto no-scrollbar">
        <div className="mt-4 mb-6 group relative">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div
            className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-soft bg-slate-100 dark:bg-card-dark group"
          >
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url("${imageUrl}")` }}
            />

            {/* Quick Actions for Photo */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={startCamera} className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full p-2 border border-white/20 shadow-lg text-primary">
                <span className="material-symbols-outlined text-xl">camera</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full p-2 border border-white/20 shadow-lg text-teal-accent">
                <span className="material-symbols-outlined text-xl">photo_library</span>
              </button>
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/80 dark:bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-text-main dark:text-white/90 border border-white/20">
              <span className="material-symbols-outlined text-sm">{hideLocations ? 'location_off' : 'location_on'}</span>
              <span className="text-[11px] font-jakarta font-medium truncate max-w-[150px]">{hideLocations ? 'Location Hidden' : location}</span>
            </div>

            <button
              onClick={startCamera}
              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors"
            >
              {!imageUrl && <span className="material-symbols-outlined text-white text-4xl">add_a_photo</span>}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-[11px] font-jakarta font-bold text-text-muted/70 dark:text-gray-500 uppercase tracking-widest mb-4 px-1">With Whom?</h3>
          <div className="flex overflow-x-auto no-scrollbar -mx-1 px-1 gap-5 pb-2">
            {people.map(person => (
              <button
                key={person.id}
                onClick={() => handleTogglePerson(person.id)}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
              >
                <div className={`w-14 h-14 rounded-full border-2 transition-all overflow-hidden ${selectedPeople.includes(person.id) ? 'border-teal-accent scale-105 ring-2 ring-teal-accent/20' : 'border-transparent grayscale opacity-70'}`}>
                  <img alt={person.name} className="w-full h-full object-cover" src={person.imageUrl} />
                </div>
                <span className={`text-[10px] font-semibold ${selectedPeople.includes(person.id) ? 'text-teal-accent' : 'text-text-muted dark:text-gray-500'}`}>{person.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative mb-8 bg-white/30 dark:bg-card-dark/30 rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-whisper">
          <span className="absolute -top-4 -left-1 text-5xl text-teal-accent/10 font-news italic select-none">“</span>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full bg-transparent border-none p-0 text-lg font-news italic leading-relaxed text-text-main dark:text-gray-200 placeholder:text-text-muted/40 dark:placeholder:text-gray-600 focus:ring-0 resize-none min-h-[140px]"
            placeholder="What's on your mind?"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleRandomPrompt}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-teal-accent bg-teal-accent/10 rounded-full hover:bg-teal-accent/20 transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${isGenerating ? 'animate-spin' : ''}`}>lightbulb</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{isGenerating ? 'Looking...' : 'Inspire Me'}</span>
            </button>
          </div>
        </div>

        {/* Voice Memory Section */}
        <div className="mb-8">
          <h3 className="text-[11px] font-jakarta font-bold text-text-muted/70 dark:text-gray-500 uppercase tracking-widest mb-4 px-1">Voice Memory</h3>
          <AudioRecorder
            onRecordingComplete={(url, duration) => {
              setAudioUrl(url);
              setAudioDuration(duration);
            }}
            onDelete={() => {
              setAudioUrl(undefined);
              setAudioDuration(undefined);
            }}
            initialAudioUrl={audioUrl}
            initialDuration={audioDuration}
          />
        </div>

        {/* Time Capsule Section */}
        <div className="mb-8 bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined">hourglass_top</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-main dark:text-gray-200">Time Capsule</h3>
                <p className="text-xs text-text-muted dark:text-gray-500">Lock this memory for the future</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isCapsule} onChange={(e) => setIsCapsule(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-500/30 rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-white/10 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {isCapsule && (
            <div className="mt-4 pt-4 border-t border-amber-100 dark:border-amber-500/20">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Unlock Date</label>
              <input
                type="date"
                value={unlockDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-amber-200 dark:border-amber-500/30 rounded-xl px-4 py-3 text-sm focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between px-1 mb-4">
            <h3 className="text-[11px] font-jakarta font-bold text-text-muted/70 dark:text-gray-500 uppercase tracking-widest">Atmosphere</h3>
            <button
              onClick={() => setIsHighlight(!isHighlight)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm ${isHighlight ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' : 'bg-gray-100 text-gray-400 dark:bg-card-dark'}`}
            >
              <span className={`material-symbols-outlined text-[14px] ${isHighlight ? 'fill' : ''}`}>star</span>
              {isHighlight ? 'Highlight' : 'Normal'}
            </button>
          </div>
          <div className="bg-white/40 dark:bg-card-dark/40 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between gap-2">
            {moods.map(mood => (
              <button
                key={mood.name}
                onClick={() => setSelectedMood(mood.name)}
                className={`group/mood flex flex-col items-center flex-1 transition-all p-2 rounded-xl ${selectedMood === mood.name ? 'bg-teal-accent/10 scale-105' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <span className={`material-symbols-outlined text-xl ${selectedMood === mood.name ? 'text-teal-accent fill' : 'text-text-muted dark:text-gray-500 hover:text-teal-accent'}`}>
                  {mood.icon}
                </span>
                <span className={`text-[8px] font-bold uppercase mt-1 ${selectedMood === mood.name ? 'text-teal-accent' : 'text-text-muted dark:text-gray-500'}`}>{mood.name}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Capture;
