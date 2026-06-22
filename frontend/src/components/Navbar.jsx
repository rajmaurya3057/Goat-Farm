import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS, ROUTES } from '../utils/constants';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-surface-700 hover:bg-surface-100 lg:hidden"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold text-surface-900">Dashboard</h1>
          <p className="hidden text-xs text-surface-700 sm:block">Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-surface-900">{user?.name}</p>
          <p className="text-xs text-surface-700">{ROLE_LABELS[user?.role] || user?.role}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm font-medium text-surface-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
