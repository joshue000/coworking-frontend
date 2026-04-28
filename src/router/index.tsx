import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SpacesPage } from '@/pages/SpacesPage';
import { SpaceDetailPage } from '@/pages/SpaceDetailPage';
import { ReservationsPage } from '@/pages/ReservationsPage';
import { AdminPage } from '@/pages/AdminPage';
import { PlacesPage } from '@/pages/PlacesPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/spaces" replace /> },
      { path: 'spaces', element: <SpacesPage />, errorElement: <ErrorBoundary /> },
      { path: 'spaces/:id', element: <SpaceDetailPage />, errorElement: <ErrorBoundary /> },
      { path: 'reservations', element: <ReservationsPage />, errorElement: <ErrorBoundary /> },
      { path: 'admin', element: <AdminPage />, errorElement: <ErrorBoundary /> },
      { path: 'manage/places', element: <PlacesPage />, errorElement: <ErrorBoundary /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
