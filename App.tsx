import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { View, Memory, Person } from './types';
import { storageService } from './services/storageService';
import Onboarding from './views/Onboarding';
import Timeline from './views/Timeline';
import People from './views/People';
import Capture from './views/Capture';
import Insights from './views/Insights';
import Profile from './views/Profile';
import MemoryDetail from './views/MemoryDetail';
import PersonDetail from './views/PersonDetail';
import AddPerson from './views/AddPerson';
import MapExplorer from './views/MapExplorer';
import BottomNav from './components/BottomNav';
import PageTransition from './components/PageTransition';
import PasscodeScreen from './components/PasscodeScreen';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { isLocked, unlockApp, logout } = useAuth();

  const readHideLocations = () => {
    try {
      const raw = localStorage.getItem('mc_settings');
      if (!raw) return false;
      const parsed = JSON.parse(raw) as { toggles?: Record<string, unknown> };
      return Boolean(parsed?.toggles?.hideLocations);
    } catch {
      return false;
    }
  };

  const [currentView, setCurrentView] = useState<View>(() => {
    return localStorage.getItem('mc_onboarded') === 'true' ? 'timeline' : 'onboarding';
  });
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [hideLocations, setHideLocations] = useState<boolean>(() => readHideLocations());
  const [isLoading, setIsLoading] = useState(true);

  // State
  const [memories, setMemories] = useState<Memory[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  // Initial Data Load & Migration
  useEffect(() => {
    const loadData = async () => {
      try {
        await storageService.migrateFromLocalStorage();
        const loadedMemories = await storageService.getMemories();
        const loadedPeople = await storageService.getPeople();

        // Sort memories by date (newest first)
        loadedMemories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setMemories(loadedMemories);
        setPeople(loadedPeople);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Initial theme check
    const savedTheme = localStorage.getItem('mc_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    // Initial font size check
    const savedFontSize = localStorage.getItem('mc_font_size') || 'standard';
    const sizeMap: Record<string, string> = {
      'small': '14px',
      'standard': '16px',
      'large': '18px'
    };
    document.documentElement.style.fontSize = sizeMap[savedFontSize] || '16px';
  }, []);

  useEffect(() => {
    const handleSettingsChange = () => setHideLocations(readHideLocations());
    window.addEventListener('mc_settings_changed', handleSettingsChange as EventListener);
    window.addEventListener('storage', handleSettingsChange);
    return () => {
      window.removeEventListener('mc_settings_changed', handleSettingsChange as EventListener);
      window.removeEventListener('storage', handleSettingsChange);
    };
  }, []);



  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (view !== 'detail' && view !== 'capture') {
      setEditingMemory(null);
    }
    if (view === 'timeline') {
      localStorage.setItem('mc_onboarded', 'true');
    }
  };

  const handleSelectMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    handleNavigate('detail');
  };

  const handleSelectPerson = (personId: string) => {
    setSelectedPersonId(personId);
    handleNavigate('person-detail');
  };

  const handleSaveMemory = async (newMemory: Memory) => {
    await storageService.saveMemory(newMemory);
    if (editingMemory) {
      setMemories(prev => prev.map(m => m.id === newMemory.id ? newMemory : m));
    } else {
      setMemories(prev => [newMemory, ...prev]);
    }
    handleNavigate('timeline');
  };

  const handleDeleteMemory = async (id: string) => {
    await storageService.deleteMemory(id);
    setMemories(prev => prev.filter(m => m.id !== id));
    handleNavigate('timeline');
  };

  const handleSavePerson = async (newPerson: Person) => {
    await storageService.savePerson(newPerson);
    setPeople(prev => [...prev, newPerson]);
    handleNavigate('people');
  };

  const handleDeletePerson = async (id: string) => {
    if (confirm('Are you sure you want to delete this person? Shared memories will remain but they will be untagged.')) {
      await storageService.deletePerson(id);
      setPeople(prev => prev.filter(p => p.id !== id));

      // Also update memories to remove this person ID
      const updatedMemories = memories.map(m => ({
        ...m,
        peopleIds: m.peopleIds.filter(pid => pid !== id)
      }));
      setMemories(updatedMemories);

      // Update each memory in storage that was changed
      updatedMemories.forEach(async m => {
        if (m.peopleIds.length !== memories.find(old => old.id === m.id)?.peopleIds.length) {
          await storageService.saveMemory(m);
        }
      });

      handleNavigate('people');
    }
  };

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
    handleNavigate('capture');
  };

  // Lock Screen
  if (isLocked) {
    return (
      <PasscodeScreen
        mode="verify"
        onSuccess={unlockApp}
        savedPasscode={localStorage.getItem('mc_user_passcode') || ''}
      />
    );
  }

  // Onboarding
  if (currentView === 'onboarding') {
    return <Onboarding onComplete={() => handleNavigate('timeline')} />;
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-jakarta text-text-muted dark:text-gray-400">Loading Memories...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    setCurrentView('onboarding');
  };

  const renderView = () => {
    switch (currentView) {
      case 'timeline':
        return (
          <Timeline
            memories={memories}
            onSelectMemory={handleSelectMemory}
            onNavigate={handleNavigate}
            hideLocations={hideLocations}
          />
        );
      case 'people':
        return (
          <People
            people={people}
            memories={memories}
            onNavigate={handleNavigate}
            onSelectPerson={handleSelectPerson}
            onAddPerson={() => handleNavigate('add-person')}
          />
        );
      case 'capture':
        return (
          <Capture
            onSave={handleSaveMemory}
            onCancel={() => handleNavigate('timeline')}
            people={people}
            editingMemory={editingMemory || undefined}
          />
        );
      case 'insights':
        return <Insights memories={memories} people={people} />;
      case 'profile':
        return <Profile memories={memories} people={people} onLogout={handleLogout} />;
      case 'detail':
        return selectedMemory ? (
          <MemoryDetail
            memory={selectedMemory}
            onBack={() => handleNavigate('timeline')}
            onEdit={handleEditMemory}
            onDelete={handleDeleteMemory}
            people={people}
          />
        ) : null;
      case 'person-detail':
        const selectedPerson = people.find(p => p.id === selectedPersonId);
        return selectedPerson ? (
          <PersonDetail
            person={selectedPerson}
            memories={memories}
            onBack={() => handleNavigate('people')}
            onSelectMemory={handleSelectMemory}
            onDelete={handleDeletePerson}
          />
        ) : null;
      case 'add-person':
        return (
          <AddPerson
            onSave={handleSavePerson}
            onCancel={() => handleNavigate('people')}
          />
        );
      case 'map-explorer':
        return (
          <MapExplorer
            memories={memories}
            onSelectMemory={handleSelectMemory}
            onBack={() => handleNavigate('timeline')}
            hideLocations={hideLocations}
          />
        );
      default:
        return (
          <Timeline
            memories={memories}
            onSelectMemory={handleSelectMemory}
            onNavigate={handleNavigate}
            hideLocations={hideLocations}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={currentView}>
            {renderView()}
          </PageTransition>
        </AnimatePresence>
      </main>

      {currentView !== 'onboarding' &&
        currentView !== 'capture' &&
        currentView !== 'detail' &&
        currentView !== 'person-detail' &&
        currentView !== 'add-person' &&
        currentView !== 'map-explorer' && (
          <BottomNav activeView={currentView} onNavigate={handleNavigate} />
        )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="h-[100dvh] w-full bg-background-light dark:bg-background-dark sm:bg-gray-100 sm:dark:bg-gray-900 sm:flex sm:items-center sm:justify-center">
      <div className="w-full h-full sm:max-w-md sm:h-[90vh] bg-background-light dark:bg-background-dark relative overflow-hidden sm:shadow-2xl sm:rounded-2xl transition-all duration-300">
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </div>
    </div>
  );
};

export default App;
