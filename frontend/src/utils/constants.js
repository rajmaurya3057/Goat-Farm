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
};

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Goats', path: '/goats', icon: 'goats' },
  { label: 'Medicines', path: '/medicines', icon: 'medicines' },
  { label: 'Alerts', path: '/alerts', icon: 'alerts', disabled: true },
  { label: 'Settings', path: '/settings', icon: 'settings', disabled: true },
];

export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  STAFF: 'Staff',
  VETERINARIAN: 'Veterinarian',
};
