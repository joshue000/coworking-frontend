import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { ApiKeySetup } from '@/components/ApiKeySetup';
import { useAuthStore } from '@/store/auth.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  const apiKey = useAuthStore((s) => s.apiKey);

  return (
    <QueryClientProvider client={queryClient}>
      {!apiKey ? <ApiKeySetup /> : <RouterProvider router={router} />}
    </QueryClientProvider>
  );
}
