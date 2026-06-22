import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { alertsApi } from '../api/alerts.api';
import { getErrorMessage } from '../utils/helpers';

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'Critical', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  HIGH: { label: 'High', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  LOW: { label: 'Low', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
};

const TYPE_LABELS = {
  LOW_STOCK: 'Low Stock',
  MEDICINE_EXPIRING: 'Medicine Expiring',
  MEDICINE_EXPIRED: 'Medicine Expired',
  VACCINATION_DUE: 'Vaccination Due',
  VACCINATION_OVERDUE: 'Vaccination Overdue',
};

const TYPE_ICONS = {
  LOW_STOCK: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
    </svg>
  ),
  MEDICINE_EXPIRING: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
    </svg>
  ),
  MEDICINE_EXPIRED: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  VACCINATION_DUE: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  VACCINATION_OVERDUE: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const FILTER_READ = ['all', 'unread', 'read'];
const FILTER_SEVERITY = ['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const FILTER_TYPE = ['all', 'LOW_STOCK', 'MEDICINE_EXPIRING', 'MEDICINE_EXPIRED', 'VACCINATION_DUE', 'VACCINATION_OVERDUE'];

export default function AlertListPage() {
  const queryClient = useQueryClient();

  const [readFilter, setReadFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const params = {
    page,
    limit,
    ...(readFilter !== 'all' && { isRead: readFilter === 'read' }),
    ...(severityFilter !== 'all' && { severity: severityFilter }),
    ...(typeFilter !== 'all' && { type: typeFilter }),
  };

  const alertsQuery = useQuery({
    queryKey: ['alerts', params],
    queryFn: async () => {
      const res = await alertsApi.getAlerts(params);
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => { await alertsApi.markAsRead(id); },
    onSuccess: () => {
      toast.success('Alert marked as read');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to mark alert as read')),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => { await alertsApi.markAllAsRead(); },
    onSuccess: () => {
      toast.success('All alerts marked as read');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to mark all as read')),
  });

  const handleClearFilters = () => {
    setReadFilter('all');
    setSeverityFilter('all');
    setTypeFilter('all');
    setPage(1);
  };

  const alerts = alertsQuery.data?.data ?? [];
  const meta = alertsQuery.data?.meta ?? { page: 1, limit: 15, totalRecords: 0, totalPages: 1 };
  const unreadCount = alertsQuery.data?.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-3">
            Alerts & Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-red-600 text-white text-xs font-bold px-2">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-surface-700">
            System-generated alerts for medicine stock, expiry, and vaccination schedules.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-200 hover:bg-surface-50 text-surface-800 px-4 py-2.5 text-sm font-semibold transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {markAllReadMutation.isPending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-300 border-t-surface-800" />
            )}
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Read Status Filter */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">Read Status</label>
            <div className="flex gap-2 flex-wrap">
              {FILTER_READ.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { setReadFilter(opt); setPage(1); }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer capitalize ${readFilter === opt ? 'bg-primary-600 text-white border-primary-600' : 'border-surface-200 text-surface-750 hover:bg-surface-50'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">Severity</label>
            <div className="flex gap-2 flex-wrap">
              {FILTER_SEVERITY.map((sev) => {
                const config = SEVERITY_CONFIG[sev];
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => { setSeverityFilter(sev); setPage(1); }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${severityFilter === sev ? (config ? `${config.bg} ${config.border} ${config.text}` : 'bg-primary-600 text-white border-primary-600') : 'border-surface-200 text-surface-750 hover:bg-surface-50'}`}
                  >
                    {sev === 'all' ? 'All' : SEVERITY_CONFIG[sev]?.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">Alert Type</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="all">All Types</option>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {(readFilter !== 'all' || severityFilter !== 'all' || typeFilter !== 'all') && (
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={handleClearFilters} className="rounded-lg border border-surface-200 hover:bg-surface-50 px-4 py-2 text-xs font-bold text-surface-750 transition cursor-pointer">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {alertsQuery.isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-surface-200 bg-white p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-surface-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-200 rounded w-2/5" />
                  <div className="h-3 bg-surface-100 rounded w-3/4" />
                  <div className="h-3 bg-surface-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : alertsQuery.isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-surface-200 bg-white py-12 px-4 text-center">
            <div className="rounded-full bg-red-50 p-3 text-red-600 border border-red-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-surface-900">Failed to load alerts</h3>
            <p className="mt-1 text-sm text-surface-700">{getErrorMessage(alertsQuery.error)}</p>
            <button onClick={() => alertsQuery.refetch()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer">
              Retry
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-surface-200 bg-white py-16 px-4 text-center">
            <div className="rounded-full bg-emerald-50 border border-emerald-100 p-4 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-surface-900">All Clear!</h3>
            <p className="mt-1 text-sm text-surface-700">No alerts found. Try clearing your filters or check back later.</p>
            {(readFilter !== 'all' || severityFilter !== 'all' || typeFilter !== 'all') && (
              <button onClick={handleClearFilters} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-800 px-4 py-2 text-xs font-bold transition cursor-pointer">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          alerts.map((alert) => {
            const sev = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.LOW;
            const typeIcon = TYPE_ICONS[alert.type];
            const isMarkingRead = markReadMutation.isPending && markReadMutation.variables === alert._id;

            return (
              <div
                key={alert._id}
                className={`rounded-xl border p-5 transition-all duration-200 flex items-start gap-4 ${alert.isRead ? 'bg-white border-surface-200 opacity-80' : `${sev.bg} ${sev.border} shadow-sm`}`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 flex items-center justify-center rounded-xl h-10 w-10 border ${alert.isRead ? 'bg-surface-100 border-surface-200 text-surface-400' : `${sev.bg} ${sev.border} ${sev.text}`}`}>
                  {typeIcon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${alert.isRead ? 'bg-surface-100 text-surface-600 border-surface-200' : `${sev.badge}`}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${alert.isRead ? 'bg-surface-400' : sev.dot}`} />
                      {sev.label}
                    </span>
                    <span className="rounded-full bg-surface-100 border border-surface-200 px-2.5 py-0.5 text-[10px] font-semibold text-surface-600">
                      {TYPE_LABELS[alert.type] ?? alert.type}
                    </span>
                    {!alert.isRead && (
                      <span className="rounded-full bg-primary-100 border border-primary-200 px-2 py-0.5 text-[10px] font-bold text-primary-700">
                        New
                      </span>
                    )}
                  </div>
                  <h3 className={`text-sm font-bold ${alert.isRead ? 'text-surface-700' : 'text-surface-950'}`}>{alert.title}</h3>
                  <p className={`mt-0.5 text-xs leading-relaxed ${alert.isRead ? 'text-surface-500' : 'text-surface-700'}`}>{alert.description}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[11px] text-surface-500">{formatRelativeTime(alert.createdAt)}</span>
                    {alert.isRead && <span className="text-[11px] text-surface-400">• Read</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  {!alert.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(alert._id)}
                      disabled={isMarkingRead}
                      title="Mark as read"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white hover:bg-surface-50 text-surface-750 px-3 py-1.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      {isMarkingRead ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-surface-300 border-t-surface-800" />
                      ) : (
                        <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                      <span>{isMarkingRead ? 'Marking...' : 'Mark Read'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!alertsQuery.isLoading && !alertsQuery.isError && alerts.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-surface-200 bg-white px-6 py-4">
          <div className="text-xs text-surface-700">
            Showing <span className="font-semibold">{Math.min(meta.totalRecords, (page - 1) * limit + 1)}</span> to{' '}
            <span className="font-semibold">{Math.min(meta.totalRecords, page * limit)}</span> of{' '}
            <span className="font-semibold">{meta.totalRecords}</span> alerts
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-750 px-3 text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <span className="text-xs text-surface-700 font-semibold px-2">Page {page} of {meta.totalPages ?? 1}</span>
            <button onClick={() => setPage((p) => Math.min(meta.totalPages ?? 1, p + 1))} disabled={page === (meta.totalPages ?? 1)} className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-750 px-3 text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
