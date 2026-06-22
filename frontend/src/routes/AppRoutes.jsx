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
import MedicineListPage from '../pages/MedicineListPage';
import CreateMedicinePage from '../pages/CreateMedicinePage';
import EditMedicinePage from '../pages/EditMedicinePage';
import VaccinationListPage from '../pages/VaccinationListPage';
import CreateVaccinationPage from '../pages/CreateVaccinationPage';
import EditVaccinationPage from '../pages/EditVaccinationPage';
import TreatmentListPage from '../pages/TreatmentListPage';
import CreateTreatmentPage from '../pages/CreateTreatmentPage';
import EditTreatmentPage from '../pages/EditTreatmentPage';
import EquipmentListPage from '../pages/EquipmentListPage';
import CreateEquipmentPage from '../pages/CreateEquipmentPage';
import EditEquipmentPage from '../pages/EditEquipmentPage';
import ViewEquipmentPage from '../pages/ViewEquipmentPage';
import AlertListPage from '../pages/AlertListPage';
import SettingsPage from '../pages/SettingsPage';
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
        {
          path: ROUTES.MEDICINES,
          element: <MedicineListPage />,
        },
        {
          path: ROUTES.CREATE_MEDICINE,
          element: <CreateMedicinePage />,
        },
        {
          path: ROUTES.EDIT_MEDICINE,
          element: <EditMedicinePage />,
        },
        {
          path: ROUTES.VACCINATIONS,
          element: <VaccinationListPage />,
        },
        {
          path: ROUTES.CREATE_VACCINATION,
          element: <CreateVaccinationPage />,
        },
        {
          path: ROUTES.EDIT_VACCINATION,
          element: <EditVaccinationPage />,
        },
        {
          path: ROUTES.TREATMENTS,
          element: <TreatmentListPage />,
        },
        {
          path: ROUTES.CREATE_TREATMENT,
          element: <CreateTreatmentPage />,
        },
        {
          path: ROUTES.EDIT_TREATMENT,
          element: <EditTreatmentPage />,
        },
        {
          path: ROUTES.EQUIPMENT,
          element: <EquipmentListPage />,
        },
        {
          path: ROUTES.CREATE_EQUIPMENT,
          element: <CreateEquipmentPage />,
        },
        {
          path: ROUTES.EDIT_EQUIPMENT,
          element: <EditEquipmentPage />,
        },
        {
          path: ROUTES.VIEW_EQUIPMENT,
          element: <ViewEquipmentPage />,
        },
        {
          path: ROUTES.ALERTS,
          element: <AlertListPage />,
        },
        {
          path: ROUTES.SETTINGS,
          element: <SettingsPage />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to={ROUTES.DASHBOARD} replace />,
    },
  ];
}
