import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  apiKey: string;
  authError: string;
  setApiKey: (key: string) => void;
  clearApiKey: (reason?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      apiKey: '',
      authError: '',
      setApiKey: (apiKey) => set({ apiKey, authError: '' }),
      clearApiKey: (reason = '') => set({ apiKey: '', authError: reason }),
    }),
    { name: 'coworking-auth', partialize: (s) => ({ apiKey: s.apiKey }) }
  )
);
