import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { NAV_ITEMS } from '../utils/constants';
import { settingsApi } from '../api/settings.api';

function NavIcon({ name }) {
  const icons = {
    dashboard: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 013.75 18v-2.25z"
      />
    ),
    goats: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3.5 5.5L12 22l2.5-8.5C16.5 12.5 18 10.5 18 8c0-3.5-2.5-6-6-6zm0 3a2 2 0 110 4 2 2 0 010-4z"
      />
    ),
    medicines: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104a.75.75 0 00-.75-.75H7.5a.75.75 0 000 1.5h.375v2.247a3.75 3.75 0 01-.777 2.302L3.89 12.827a5.25 5.25 0 00-.64 2.58v3.843A1.5 1.5 0 004.75 20.75h14.5a1.5 1.5 0 001.5-1.5v-3.843a5.25 5.25 0 00-.64-2.58l-3.208-4.428a3.75 3.75 0 01-.777-2.302V3.854h.375a.75.75 0 000-1.5h-1.5a.75.75 0 00-.75.75v3.197a1.5 1.5 0 00.31.92l3.209 4.428c.45.621.691 1.36.691 2.12v3.843H5.25v-3.843c0-.76.24-1.499.692-2.12l3.208-4.428a1.5 1.5 0 00.31-.92V3.104z"
      />
    ),
    vaccinations: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
      />
    ),
    treatments: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    equipment: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75a4.5 4.5 0 01-4.822 4.492L12.5 15.67a2.25 2.25 0 01-3.182-3.182l4.428-4.428A4.5 4.5 0 0118.25 3.25c1.19 0 2.274.463 3.084 1.218A1.5 1.5 0 0021.75 6.75zM12.5 15.67l-6 6A1.5 1.5 0 014.28 19.46l6-6M4.28 19.46a1.5 1.5 0 10-2.12-2.12l-1 1A1.5 1.5 0 003.28 20.46l1-1z"
      />
    ),
    alerts: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    ),
    settings: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
    ),
  };

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {icons[name]}
    </svg>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Fetch settings for dynamic farm name and logo
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsApi.getSettings();
      return res.data?.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — settings rarely change
  });

  const farmName = settingsQuery.data?.farmName || 'GFMS';
  const farmLogo = settingsQuery.data?.logo;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-surface-950/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-surface-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header — dynamic logo and farm name */}
        <div className="flex h-16 items-center gap-3 border-b border-surface-200 px-6">
          {farmLogo ? (
            <img
              src={farmLogo}
              alt={farmName}
              className="h-9 w-9 rounded-lg object-contain border border-surface-200 bg-surface-50 p-0.5"
              onError={(e) => {
                // Fallback to default icon on load failure
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Default goat icon — shown when no logo, or when logo fails to load */}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white"
            style={{ display: farmLogo ? 'none' : 'flex' }}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3.5 5.5L12 22l2.5-8.5C16.5 12.5 18 10.5 18 8c0-3.5-2.5-6-6-6zm0 3a2 2 0 110 4 2 2 0 010-4z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-surface-900 leading-tight truncate max-w-[140px]">{farmName}</p>
            <p className="text-xs text-surface-700">Goat Farm Manager</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? currentPath === '/dashboard'
                : currentPath.startsWith(item.path);

            if (item.disabled) {
              return (
                <div
                  key={item.path}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-not-allowed text-surface-700/50"
                >
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                  <span className="ml-auto rounded-full bg-surface-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-surface-700">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-surface-700 hover:bg-surface-100'
                }`}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-surface-200 p-4">
          <p className="text-xs text-surface-700">Goat Farm Management System v1.0</p>
        </div>
      </aside>
    </>
  );
}
