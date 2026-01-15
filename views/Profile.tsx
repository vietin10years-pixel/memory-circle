
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PasscodeScreen from '../components/PasscodeScreen';
import { usePWA } from '../hooks/usePWA';
import { generateJournalPDF } from '../services/pdfService';
import { storageService } from '../services/storageService';
import { Memory, Person } from '../types';

interface ProfileProps {
  memories: Memory[];
  people: Person[];
  onLogout: () => void;
}

type SettingsToggleId =
  | 'hideLocations'
  | 'encryptionActive'
  | 'dailyReminder'
  | 'weeklySummary'
  | 'memoryAnniversary'
  | 'compressImages'
  | 'lowResPreviews';

type AppSettings = {
  toggles: Record<SettingsToggleId, boolean>;
};

const defaultSettings: AppSettings = {
  toggles: {
    hideLocations: false,
    encryptionActive: true,
    dailyReminder: false,
    weeklySummary: false,
    memoryAnniversary: true,
    compressImages: false,
    lowResPreviews: false
  }
};

const readSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem('mc_settings');
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const mergedToggles = { ...defaultSettings.toggles, ...(parsed.toggles || {}) };
    return { toggles: mergedToggles };
  } catch {
    return defaultSettings;
  }
};

const writeSettings = (settings: AppSettings) => {
  localStorage.setItem('mc_settings', JSON.stringify(settings));
  window.dispatchEvent(new Event('mc_settings_changed'));
};

const Profile: React.FC<ProfileProps> = ({ memories, people, onLogout }) => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [settingsView, setSettingsView] = useState<string | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => readSettings());

  // Passcode State
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeMode, setPasscodeMode] = useState<'setup' | 'change'>('setup');

  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Font Size State
  const [fontSize, setFontSize] = useState<string>(() => localStorage.getItem('mc_font_size') || 'standard');

  const { profile, updateProfile, hasPasscode, setPasscode, removePasscode } = useAuth();
  const { isInstallable, install } = usePWA();

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mc_theme', 'light');
    }
  };

  const handleClearData = () => {
    if (confirm('DANGER: This will permanently erase all your memories and contacts. This action cannot be undone. Proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleToggleSetting = async (toggleId: SettingsToggleId) => {
    const current = settings.toggles[toggleId];
    const nextValue = !current;

    if (toggleId === 'hideLocations' && nextValue) {
      if (!confirm('Hide locations across the app and in exports?')) {
        return;
      }
    }

    if ((toggleId === 'dailyReminder' || toggleId === 'weeklySummary') && nextValue) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Notifications permission denied. Please enable in browser settings.');
          return;
        }
      }
    }

    const newSettings = {
      ...settings,
      toggles: {
        ...settings.toggles,
        [toggleId]: nextValue
      }
    };
    setSettings(newSettings);
    writeSettings(newSettings);
  };

  const handleToggleFontSize = () => {
    const nextMap: Record<string, string> = {
      'small': 'standard',
      'standard': 'large',
      'large': 'small'
    };
    const nextSize = nextMap[fontSize] || 'standard';
    setFontSize(nextSize);
    localStorage.setItem('mc_font_size', nextSize);

    const sizePxMap: Record<string, string> = {
      'small': '14px',
      'standard': '16px',
      'large': '18px'
    };
    document.documentElement.style.fontSize = sizePxMap[nextSize];
  };

  const handleExportPDF = async () => {
    if (memories.length === 0) {
      alert('No memories to export yet.');
      return;
    }
    await generateJournalPDF(memories);
  };

  const handleExportJSON = () => {
    const data = {
      memories,
      people,
      profile,
      settings,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-circle-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const resizedImage = await resizeImage(file);
      updateProfile({ avatar: resizedImage });
    } catch (error) {
      console.error('Error resizing image:', error);
      alert('Failed to process image. Please try another one.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);

        if (confirm('This will overwrite your current data with the backup. Are you sure?')) {
          await storageService.restoreData(data.memories || [], data.people || []);

          if (data.settings && data.settings.toggles) {
            localStorage.setItem('mc_settings', JSON.stringify(data.settings));
          }
          if (data.profile) localStorage.setItem('mc_user_profile', JSON.stringify(data.profile));

          alert('Backup restored successfully. The app will reload.');
          window.location.reload();
        }
      } catch (err) {
        console.error(err);
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleEditName = () => {
    setTempName(profile?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateProfile({ name: tempName.trim() });
      setIsEditingName(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
  };

  // Passcode Handlers
  const handleSetupPasscode = () => {
    setPasscodeMode('setup');
    setShowPasscodeModal(true);
  };

  const handleChangePasscode = () => {
    setPasscodeMode('change');
    setShowPasscodeModal(true);
  };

  const handlePasscodeSuccess = (code: string) => {
    setPasscode(code);
    setShowPasscodeModal(false);
    alert(passcodeMode === 'setup' ? 'Passcode enabled successfully.' : 'Passcode changed successfully.');
  };

  const handleRemovePasscode = () => {
    if (confirm('Are you sure you want to remove the passcode protection?')) {
      removePasscode();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-24">
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarChange}
        className="hidden"
        accept="image/*"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json"
      />
      {/* Header */}
      <div className="relative pt-12 pb-8 px-6 bg-gradient-to-b from-primary/10 to-transparent dark:from-primary/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-20 h-20 rounded-full bg-white dark:bg-card-dark shadow-sm p-1">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-teal-accent flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white">camera_alt</span>
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full shadow-md flex items-center justify-center hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <div>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-white/50 dark:bg-black/20 border border-primary/20 rounded-lg px-3 py-1 text-xl font-bold text-text-main dark:text-white focus:outline-none focus:border-primary w-40"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEditName();
                  }}
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">check</span>
                </button>
                <button
                  onClick={handleCancelEditName}
                  className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-text-main dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            ) : (
              <h1 className="text-2xl font-display font-bold text-text-main dark:text-white flex items-center gap-2">
                {profile?.name || 'User'}
                <button onClick={handleEditName} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-muted transition-colors">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
              </h1>
            )}
            <p className="text-text-muted dark:text-gray-400 text-sm">
              Member since {profile?.joinedDate ? new Date(profile.joinedDate).getFullYear() : new Date().getFullYear()}
            </p>

          </div>

        </div>
      </div>


      {/* Settings List */}
      <div className="px-6 space-y-8">

        {/* Appearance */}
        <section>
          <h2 className="text-sm font-bold text-text-muted dark:text-gray-500 uppercase tracking-wider mb-4">Appearance</h2>
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">dark_mode</span>
                <span className="text-text-main dark:text-white font-medium">Dark Mode</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div
              onClick={handleToggleFontSize}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">text_fields</span>
                <span className="text-text-main dark:text-white font-medium">Font Size</span>
              </div>
              <span className="text-sm text-text-muted capitalize">{fontSize}</span>
            </div>
          </div>
        </section>

        {/* Security (New Passcode Section) */}
        <section>
          <h2 className="text-sm font-bold text-text-muted dark:text-gray-500 uppercase tracking-wider mb-4">Security</h2>
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">lock</span>
                <span className="text-text-main dark:text-white font-medium">App Lock (Passcode)</span>
              </div>
              <button
                onClick={hasPasscode ? handleRemovePasscode : handleSetupPasscode}
                className={`w-12 h-6 rounded-full transition-colors relative ${hasPasscode ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${hasPasscode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {hasPasscode && (
              <button
                onClick={handleChangePasscode}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-500">password</span>
                  <span className="text-text-main dark:text-white font-medium">Change Passcode</span>
                </div>
                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
              </button>
            )}

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">visibility_off</span>
                <span className="text-text-main dark:text-white font-medium">Hide Locations</span>
              </div>
              <button
                onClick={() => handleToggleSetting('hideLocations')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.toggles.hideLocations ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.toggles.hideLocations ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Data & Backup */}
        <section>
          <h2 className="text-sm font-bold text-text-muted dark:text-gray-500 uppercase tracking-wider mb-4">Data & Privacy</h2>
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm overflow-hidden">
            <a
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">policy</span>
                <span className="text-text-main dark:text-white font-medium">Privacy Policy</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">open_in_new</span>
            </a>
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">save</span>
                <span className="text-text-main dark:text-white font-medium">Backup Data (JSON)</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">download</span>
            </button>

            <button
              onClick={handleImportClick}
              className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">restore</span>
                <span className="text-text-main dark:text-white font-medium">Restore Data</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">upload</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">picture_as_pdf</span>
                <span className="text-text-main dark:text-white font-medium">Export Journal to PDF</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">download</span>
            </button>

            {isInstallable && (
              <button
                onClick={install}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-100 dark:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-500">install_mobile</span>
                  <span className="text-text-main dark:text-white font-medium">Install App</span>
                </div>
                <span className="material-symbols-outlined text-gray-400">download</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-100 dark:border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">logout</span>
                <span className="text-text-main dark:text-white font-medium">Log Out</span>
              </div>
            </button>

            <button
              onClick={handleClearData}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500 group-hover:text-red-600">delete_forever</span>
                <span className="text-red-500 font-medium group-hover:text-red-600">Erase All Data</span>
              </div>
            </button>
          </div>
          <p className="mt-4 text-xs text-text-muted text-center px-4 leading-relaxed">
            Memory Circle is offline-first. Your data is stored locally on this device.
            Deleting the app or clearing browser data will remove your memories.
            Please export your journal regularly.
          </p>
        </section>

        <div className="text-center pb-8">
          <p className="text-xs text-text-muted font-display italic">Memory Circle v1.0.0</p>
        </div>
      </div>

      <AnimatePresence>
        {showPasscodeModal && (
          <PasscodeScreen
            mode={passcodeMode}
            onSuccess={handlePasscodeSuccess}
            onCancel={() => setShowPasscodeModal(false)}
            savedPasscode={passcodeMode === 'change' ? localStorage.getItem('mc_user_passcode') || '' : undefined}
          />
        )}
      </AnimatePresence>
    </div >
  );
};

export default Profile;
