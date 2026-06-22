export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const TOKEN_KEY = 'gfms_auth_token';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  GOATS: '/goats',
  CREATE_GOAT: '/goats/create',
  EDIT_GOAT: '/goats/:id/edit',
  VIEW_GOAT: '/goats/:id',
  MEDICINES: '/medicines',
  CREATE_MEDICINE: '/medicines/create',
  EDIT_MEDICINE: '/medicines/:id/edit',
  VACCINATIONS: '/vaccinations',
  CREATE_VACCINATION: '/vaccinations/create',
  EDIT_VACCINATION: '/vaccinations/:id/edit',
  TREATMENTS: '/treatments',
  CREATE_TREATMENT: '/treatments/create',
  EDIT_TREATMENT: '/treatments/:id/edit',
  EQUIPMENT: '/equipment',
  CREATE_EQUIPMENT: '/equipment/create',
  EDIT_EQUIPMENT: '/equipment/:id/edit',
  VIEW_EQUIPMENT: '/equipment/:id',
  ALERTS: '/alerts',
  SETTINGS: '/settings',
};

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Goats', path: '/goats', icon: 'goats' },
  { label: 'Medicines', path: '/medicines', icon: 'medicines' },
  { label: 'Vaccinations', path: '/vaccinations', icon: 'vaccinations' },
  { label: 'Treatments', path: '/treatments', icon: 'treatments' },
  { label: 'Equipment', path: '/equipment', icon: 'equipment' },
  { label: 'Alerts', path: '/alerts', icon: 'alerts' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
];

export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  STAFF: 'Staff',
  VETERINARIAN: 'Veterinarian',
};
