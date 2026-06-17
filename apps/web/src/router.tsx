import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { FacilitiesPage } from './features/facilities/FacilitiesPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <FacilitiesPage /> },
      { path: 'facilities', element: <FacilitiesPage /> },
    ],
  },
]);
