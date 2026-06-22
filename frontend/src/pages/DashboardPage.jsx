import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../utils/constants';
import { goatsApi } from '../api/goats.api';
import { medicinesApi } from '../api/medicines.api';
import { vaccinationsApi } from '../api/vaccinations.api';
import { treatmentsApi } from '../api/treatments.api';
import StatCard from '../components/StatCard';

export default function DashboardPage() {
  const { user } = useAuth();

  // Queries for fetching metadata counts
  const goatsQuery = useQuery({
    queryKey: ['goats', 'count'],
    queryFn: async () => {
      const res = await goatsApi.getGoats({ limit: 1 });
      return res.data.meta?.totalRecords ?? 0;
    },
  });

  const medicinesQuery = useQuery({
    queryKey: ['medicines', 'count'],
    queryFn: async () => {
      const res = await medicinesApi.getMedicines({ limit: 1 });
      return res.data.meta?.totalRecords ?? 0;
    },
  });

  const lowStockQuery = useQuery({
    queryKey: ['medicines', 'count', 'low-stock'],
    queryFn: async () => {
      const res = await medicinesApi.getMedicines({ status: 'Low Stock', limit: 1 });
      return res.data.meta?.totalRecords ?? 0;
    },
  });

  const vaccinationsQuery = useQuery({
    queryKey: ['vaccinations', 'count'],
    queryFn: async () => {
      const res = await vaccinationsApi.getVaccinations({ limit: 1 });
      return res.data.meta?.totalRecords ?? 0;
    },
  });

  const treatmentsQuery = useQuery({
    queryKey: ['treatments', 'count'],
    queryFn: async () => {
      const res = await treatmentsApi.getTreatments({ limit: 1 });
      return res.data.meta?.totalRecords ?? 0;
    },
  });

  const handleRefreshAll = () => {
    goatsQuery.refetch();
    medicinesQuery.refetch();
    lowStockQuery.refetch();
    vaccinationsQuery.refetch();
    treatmentsQuery.refetch();
  };

  const statCards = [
    {
      title: 'Total Goats',
      value: goatsQuery.data ?? 0,
      description: 'Active, sold, dead, or pregnant',
      colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
      isLoading: goatsQuery.isLoading,
      isError: goatsQuery.isError,
      onRetry: () => goatsQuery.refetch(),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3.5 5.5L12 22l2.5-8.5C16.5 12.5 18 10.5 18 8c0-3.5-2.5-6-6-6z" />
        </svg>
      ),
    },
    {
      title: 'Total Medicines',
      value: medicinesQuery.data ?? 0,
      description: 'Unique tracked in inventory',
      colorClass: 'bg-blue-50 text-blue-700 border-blue-100/80',
      isLoading: medicinesQuery.isLoading,
      isError: medicinesQuery.isError,
      onRetry: () => medicinesQuery.refetch(),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
        </svg>
      ),
    },
    {
      title: 'Low Stock Medicines',
      value: lowStockQuery.data ?? 0,
      description: 'Medicines with quantity < 5',
      colorClass: 'bg-amber-50 text-amber-700 border-amber-100/80',
      isLoading: lowStockQuery.isLoading,
      isError: lowStockQuery.isError,
      onRetry: () => lowStockQuery.refetch(),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      title: 'Vaccinations',
      value: vaccinationsQuery.data ?? 0,
      description: 'Total recorded administrations',
      colorClass: 'bg-purple-50 text-purple-700 border-purple-100/80',
      isLoading: vaccinationsQuery.isLoading,
      isError: vaccinationsQuery.isError,
      onRetry: () => vaccinationsQuery.refetch(),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      title: 'Treatments',
      value: treatmentsQuery.data ?? 0,
      description: 'Total medical logs recorded',
      colorClass: 'bg-rose-50 text-rose-700 border-rose-100/80',
      isLoading: treatmentsQuery.isLoading,
      isError: treatmentsQuery.isError,
      onRetry: () => treatmentsQuery.refetch(),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
  ];

  const anyLoading = goatsQuery.isLoading || medicinesQuery.isLoading || lowStockQuery.isLoading || vaccinationsQuery.isLoading || treatmentsQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-surface-900">
            Welcome back, {user?.name}
          </h2>
          <p className="mt-1 text-sm text-surface-700">
            You are signed in as{' '}
            <span className="font-medium text-primary-700">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
            . Your farm management dashboard is ready.
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          disabled={anyLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-surface-200 hover:bg-surface-50 text-surface-700 px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`h-4 w-4 text-surface-600 ${anyLoading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
          </svg>
          Refresh Stats
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 animate-fade-in">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            colorClass={card.colorClass}
            isLoading={card.isLoading}
            isError={card.isError}
            onRetry={card.onRetry}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-surface-900">Quick Actions</h3>
          <p className="mt-1 text-sm text-surface-700">
            Module pages will be available in upcoming releases.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['Goats', 'Medicines', 'Vaccinations', 'Treatments'].map((module) => (
              <div
                key={module}
                className="flex items-center justify-between rounded-lg border border-dashed border-surface-200 bg-surface-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-surface-700">{module}</span>
                <span className="rounded-full bg-surface-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-surface-700">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-surface-900">Account Details</h3>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between border-b border-surface-100 pb-3">
              <dt className="text-sm text-surface-700">Name</dt>
              <dd className="text-sm font-medium text-surface-900">{user?.name}</dd>
            </div>
            <div className="flex justify-between border-b border-surface-100 pb-3">
              <dt className="text-sm text-surface-700">Email</dt>
              <dd className="text-sm font-medium text-surface-900">{user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-surface-700">Role</dt>
              <dd className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                {ROLE_LABELS[user?.role] || user?.role}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

