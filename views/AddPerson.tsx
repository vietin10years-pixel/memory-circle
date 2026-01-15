
import React, { useState, useRef } from 'react';
import { Person } from '../types';

interface AddPersonProps {
  onSave: (person: Person) => void;
  onCancel: () => void;
}

const AddPerson: React.FC<AddPersonProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=400');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !role.trim()) return;
    const newPerson: Person = {
      id: Date.now().toString(),
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      memoriesCount: 0,
      imageUrl: imageUrl
    };
    onSave(newPerson);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between px-6 pt-12 pb-6 border-b border-primary/5 sticky top-0 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md z-30">
        <button onClick={onCancel} className="text-text-muted hover:text-text-main dark:text-gray-400 dark:hover:text-white text-sm font-medium transition-colors">Cancel</button>
        <h2 className="text-text-main dark:text-white font-bold font-display uppercase tracking-widest text-xs">New Connection</h2>
        <button 
          onClick={handleSave}
          disabled={!name.trim() || !role.trim()}
          className={`text-sm font-bold transition-all ${name.trim() && role.trim() ? 'text-teal-accent' : 'text-gray-300 dark:text-gray-600'}`}
        >
          Add
        </button>
      </header>

      <main className="flex-1 px-8 pt-10 pb-32">
        <div className="flex flex-col items-center mb-10">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative size-32 rounded-full overflow-hidden border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary cursor-pointer hover:bg-primary/5 transition-all shadow-soft"
          >
            <img src={imageUrl} alt="Avatar Preview" className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-40" />
            <div className="relative z-10 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-3xl">photo_camera</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Update Photo</span>
            </div>
            {!imageUrl && (
              <div className="flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Photo</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="group flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted/60 dark:text-gray-500 ml-1 transition-colors group-focus-within:text-teal-accent">Legal or Nickname</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grandma Margaret"
              className="bg-white/70 dark:bg-card-dark border-none rounded-2xl py-4 px-5 text-lg font-jakarta shadow-whisper focus:ring-2 focus:ring-teal-accent/20 transition-all dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
            />
          </div>

          <div className="group flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted/60 dark:text-gray-500 ml-1 transition-colors group-focus-within:text-teal-accent">Relationship / Role</label>
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Family Mentor"
              className="bg-white/70 dark:bg-card-dark border-none rounded-2xl py-4 px-5 text-lg font-jakarta shadow-whisper focus:ring-2 focus:ring-teal-accent/20 transition-all dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
            />
          </div>

          <div className="group flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted/60 dark:text-gray-500 ml-1 transition-colors group-focus-within:text-teal-accent">Personal Notes</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="What makes them special? Shared interests, meaningful words..."
              className="bg-white/70 dark:bg-card-dark border-none rounded-2xl py-4 px-5 text-base font-news italic shadow-whisper focus:ring-2 focus:ring-teal-accent/20 transition-all dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 resize-none"
            />
          </div>
        </div>

        <div className="mt-12 p-6 bg-teal-accent/5 dark:bg-teal-accent/10 rounded-2xl border border-teal-accent/10 flex items-start gap-4">
          <span className="material-symbols-outlined text-teal-accent/60 mt-0.5">shield_person</span>
          <p className="text-xs text-text-muted dark:text-gray-400 leading-relaxed italic">
            "Your connections are private. This profile is stored locally on your device to ensure total privacy for your inner circle."
          </p>
        </div>
      </main>
    </div>
  );
};

export default AddPerson;
