
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, authService } from '../services/authService';

interface AuthContextType {
  profile: UserProfile | null;
  hasPasscode: boolean;
  isLocked: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setPasscode: (code: string) => void;
  removePasscode: () => void;
  unlockApp: (code: string) => boolean;
  lockApp: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasPasscode, setHasPasscode] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Initialize
    const currentProfile = authService.getProfile();
    const hasCode = authService.hasPasscode();
    
    setProfile(currentProfile);
    setHasPasscode(hasCode);
    
    // Lock app on start if passcode exists
    if (hasCode) {
      setIsLocked(true);
    }
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = authService.updateProfile(updates);
    setProfile(updated);
  };

  const setPasscode = (code: string) => {
    authService.setPasscode(code);
    setHasPasscode(true);
  };

  const removePasscode = () => {
    authService.removePasscode();
    setHasPasscode(false);
    setIsLocked(false);
  };

  const unlockApp = (code: string): boolean => {
    const isValid = authService.verifyPasscode(code);
    if (isValid) {
      setIsLocked(false);
    }
    return isValid;
  };

  const lockApp = () => {
    if (hasPasscode) {
      setIsLocked(true);
    }
  };

  const logout = () => {
    authService.logout();
    setProfile(null);
    setHasPasscode(false);
    setIsLocked(false);
  };

  const becomeSupporter = () => {
    updateProfile({ isSupporter: true });
  };

  return (
    <AuthContext.Provider value={{ 
      profile, 
      hasPasscode, 
      isLocked, 
      updateProfile, 
      setPasscode, 
      removePasscode,
      unlockApp,
      lockApp,
      logout,
      becomeSupporter
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
