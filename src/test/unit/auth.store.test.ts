import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/auth.store';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ apiKey: '', authError: '' });
});

describe('useAuthStore', () => {
  describe('setApiKey', () => {
    it('stores the key', () => {
      useAuthStore.getState().setApiKey('my-secret-key');
      expect(useAuthStore.getState().apiKey).toBe('my-secret-key');
    });

    it('clears any previous authError', () => {
      useAuthStore.setState({ authError: 'Old error' });
      useAuthStore.getState().setApiKey('new-key');
      expect(useAuthStore.getState().authError).toBe('');
    });
  });

  describe('clearApiKey', () => {
    it('clears the key', () => {
      useAuthStore.getState().setApiKey('some-key');
      useAuthStore.getState().clearApiKey();
      expect(useAuthStore.getState().apiKey).toBe('');
    });

    it('sets authError to the provided reason', () => {
      useAuthStore.getState().clearApiKey('Session expired');
      expect(useAuthStore.getState().authError).toBe('Session expired');
    });

    it('sets authError to empty string when no reason is provided', () => {
      useAuthStore.getState().clearApiKey();
      expect(useAuthStore.getState().authError).toBe('');
    });
  });
});
