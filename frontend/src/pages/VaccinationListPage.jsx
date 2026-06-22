import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { vaccinationsApi } from '../api/vaccinations.api';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/helpers';
import { ROUTES } from '../utils/constants';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isDueStatus(nextDueDate) {
  if (!nextDueDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(nextDueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'due-soon';
  return 'ok';
}

export default function VaccinationListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [querySearch, setQuerySearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const vaccinationsQuery = useQuery({
    queryKey: ['vaccinations', { page, limit, search: querySearch }],
    queryFn: async () => {
      const res = await vaccinationsApi.getVaccinations({ page, limit, search: querySearch || undefined });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { await vaccinationsApi.deleteVaccination(id); },
    onSuccess: () => {
      toast.success('Vaccination record deleted');
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to delete vaccination')),
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setQuerySearch(searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setQuerySearch('');
    setPage(1);
  };

  const handleDelete = (id, vaccineName, goatTag) => {
    if (window.confirm(`Delete vaccination "${vaccineName}" for goat ${goatTag}? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const canEdit = user?.role === 'ADMIN' || user?.role === 'VETERINARIAN';

  const vaccinations = vaccinationsQuery.data?.data ?? [];
  const meta = vaccinationsQuery.data?.meta ?? { page: 1, limit: 10, totalRecords: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Vaccination Records</h1>
          <p className="mt-1 text-sm text-surface-700">Track vaccine history and upcoming doses for all goats.</p>
        </div>
        {canEdit && (
          <Link
            to={ROUTES.CREATE_VACCINATION}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Log Vaccination
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">Search Vaccine Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. PPR, Anthrax..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-surface-200 bg-white pl-9 pr-4 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={handleClearFilters} className="rounded-lg border border-surface-200 hover:bg-surface-50 px-4 py-2 text-xs font-bold text-surface-750 transition cursor-pointer">
              Clear
            </button>
            <button type="submit" className="rounded-lg bg-primary-600 hover:bg-primary-700 px-5 py-2 text-xs font-bold text-white transition cursor-pointer shadow-sm">
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
        {vaccinationsQuery.isLoading ? (
          <div className="divide-y divide-surface-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4">
                <div className="h-4 bg-surface-200 rounded w-32" />
                <div className="h-4 bg-surface-200 rounded w-24" />
                <div className="h-4 bg-surface-200 rounded w-20" />
                <div className="h-4 bg-surface-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : vaccinationsQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-red-50 p-3 text-red-600 border border-red-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-surface-900">Failed to load vaccinations</h3>
            <p className="mt-1 text-sm text-surface-700">{getErrorMessage(vaccinationsQuery.error)}</p>
            <button onClick={() => vaccinationsQuery.refetch()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer">
              Retry
            </button>
          </div>
        ) : vaccinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-surface-100 p-4 text-surface-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-surface-900">No vaccination records found</h3>
            <p className="mt-1 text-sm text-surface-700">Try adjusting your search or log a new vaccination.</p>
            {canEdit && (
              <Link to={ROUTES.CREATE_VACCINATION} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer">
                Log First Vaccination
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Goat</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Vaccine</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Date Given</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Next Due Date</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Veterinarian</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {vaccinations.map((vac) => {
                  const dueStatus = isDueStatus(vac.nextDueDate);
                  const dueBadge = {
                    overdue: 'bg-red-50 text-red-700 border-red-200',
                    'due-soon': 'bg-amber-50 text-amber-700 border-amber-200',
                    ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  };

                  return (
                    <tr key={vac._id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        {vac.goat ? (
                          <div>
                            <div className="font-semibold text-surface-950">{vac.goat.name || '—'}</div>
                            <div className="text-xs text-surface-550">{vac.goat.uidTag}</div>
                          </div>
                        ) : <span className="text-surface-450">Unknown</span>}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-surface-900">{vac.vaccineName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-700">{formatDate(vac.dateGiven)}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-surface-700">{formatDate(vac.nextDueDate)}</span>
                          {dueStatus && (
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${dueBadge[dueStatus]}`}>
                              {dueStatus === 'overdue' ? 'Overdue' : dueStatus === 'due-soon' ? 'Due Soon' : 'OK'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-700">{vac.veterinarian || '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          {canEdit && (
                            <Link to={`/vaccinations/${vac._id}/edit`} className="rounded-lg border border-primary-200 hover:bg-primary-50 text-primary-750 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer">
                              Edit
                            </Link>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(vac._id, vac.vaccineName, vac.goat?.uidTag || 'unknown')}
                              disabled={deleteMutation.isPending && deleteMutation.variables === vac._id}
                              className="rounded-lg border border-red-200 hover:bg-red-50 text-red-700 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                            >
                              {deleteMutation.isPending && deleteMutation.variables === vac._id ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!vaccinationsQuery.isLoading && !vaccinationsQuery.isError && vaccinations.length > 0 && (
          <div className="flex items-center justify-between border-t border-surface-200 bg-white px-6 py-4">
            <div className="text-xs text-surface-700">
              Showing <span className="font-semibold">{Math.min(meta.totalRecords, (page - 1) * limit + 1)}</span> to{' '}
              <span className="font-semibold">{Math.min(meta.totalRecords, page * limit)}</span> of{' '}
              <span className="font-semibold">{meta.totalRecords}</span> records
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-750 px-3 text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <span className="text-xs text-surface-700 font-semibold px-2">Page {page} of {meta.totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-750 px-3 text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
