import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
});

apiClient.interceptors.request.use((config) => {
  const apiKey = useAuthStore.getState().apiKey;
  if (apiKey) {
    config.headers['x-api-key'] = apiKey;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clearApiKey('Your API key is invalid or has expired.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: { message?: string } | string; message?: string }
      | undefined;
    // Backend wraps errors as { error: { message } }
    if (data?.error && typeof data.error === 'object' && data.error.message)
      return data.error.message;
    // Fallback: flat { error: string }
    if (data?.error && typeof data.error === 'string') return data.error;
    // Fallback: flat { message: string }
    if (data?.message) return data.message;
    if (!error.response) return 'No internet connection. Please check your network.';
    if (error.response.status === 401) return 'Invalid or missing API key.';
    if (error.response.status === 404) return 'Resource not found.';
    if (error.response.status === 409) return 'Conflict: the operation could not be completed.';
    if (error.response.status >= 500) return 'Server error. Please try again later.';
  }
  return 'An unexpected error occurred. Please try again.';
}

export function isFatalError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    if (!error.response) return true; // no network
    return error.response.status >= 500;
  }
  return true;
}
