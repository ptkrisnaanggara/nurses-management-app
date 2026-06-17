import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { FacilitiesPage } from './features/facilities/FacilitiesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <FacilitiesPage /> },
      { path: 'facilities', element: <FacilitiesPage /> },
    ],
  },
]);
