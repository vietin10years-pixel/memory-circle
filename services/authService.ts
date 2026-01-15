
// Local storage keys
const USER_KEY = 'mc_user_profile';
const PASSCODE_KEY = 'mc_user_passcode';

export interface UserProfile {
  name: string;
  avatar?: string;
  isSupporter: boolean;
  joinedDate: number;
}

export const authService = {
  // Profile Management
  getProfile: (): UserProfile | null => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  updateProfile: (updates: Partial<UserProfile>): UserProfile => {
    const current = authService.getProfile() || {
      name: 'User',
      isSupporter: false,
      joinedDate: Date.now()
    };
    const updated = { ...current, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  // Passcode Management
  hasPasscode: (): boolean => {
    return !!localStorage.getItem(PASSCODE_KEY);
  },

  verifyPasscode: (code: string): boolean => {
    const stored = localStorage.getItem(PASSCODE_KEY);
    return stored === code;
  },

  setPasscode: (code: string): void => {
    localStorage.setItem(PASSCODE_KEY, code);
  },

  removePasscode: (): void => {
    localStorage.removeItem(PASSCODE_KEY);
  },

  logout: (): void => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PASSCODE_KEY);
    localStorage.removeItem('mc_onboarded');
  }
};
