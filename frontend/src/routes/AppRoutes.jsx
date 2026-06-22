import { Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import GuestRoute from '../components/GuestRoute';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import GoatListPage from '../pages/GoatListPage';
import CreateGoatPage from '../pages/CreateGoatPage';
import EditGoatPage from '../pages/EditGoatPage';
import ViewGoatPage from '../pages/ViewGoatPage';
import { ROUTES } from '../utils/constants';

export default function AppRoutes() {
  return [
    {
      path: '/',
      element: <Navigate to={ROUTES.DASHBOARD} replace />,
    },
    {
      path: ROUTES.LOGIN,
      element: (
        <GuestRoute>
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        </GuestRoute>
      ),
    },
    {
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: ROUTES.DASHBOARD,
          element: <DashboardPage />,
        },
        {
          path: ROUTES.GOATS,
          element: <GoatListPage />,
        },
        {
          path: ROUTES.CREATE_GOAT,
          element: <CreateGoatPage />,
        },
        {
          path: ROUTES.EDIT_GOAT,
          element: <EditGoatPage />,
        },
        {
          path: ROUTES.VIEW_GOAT,
          element: <ViewGoatPage />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to={ROUTES.DASHBOARD} replace />,
    },
  ];
}
