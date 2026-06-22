import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { goatsApi } from '../api/goats.api';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/helpers';
import { ROUTES } from '../utils/constants';

export default function GoatListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [breedFilter, setBreedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Active query parameters (updated on button click or change)
  const [querySearch, setQuerySearch] = useState('');
  const [queryBreed, setQueryBreed] = useState('');

  // Fetch goats list
  const goatsQuery = useQuery({
    queryKey: ['goats', { page, limit, search: querySearch, gender: selectedGender, breed: queryBreed, status: selectedStatus }],
    queryFn: async () => {
      const res = await goatsApi.getGoats({
        page,
        limit,
        search: querySearch,
        gender: selectedGender || undefined,
        breed: queryBreed || undefined,
        status: selectedStatus || undefined,
      });
      return res.data;
    },
  });

  // Delete goat mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await goatsApi.deleteGoat(id);
    },
    onSuccess: () => {
      toast.success('Goat deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['goats'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete goat'));
    },
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setQuerySearch(searchTerm);
    setQueryBreed(breedFilter);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setBreedFilter('');
    setSelectedGender('');
    setSelectedStatus('');
    setQuerySearch('');
    setQueryBreed('');
    setPage(1);
  };

  const handleDelete = (id, name, tag) => {
    const confirmed = window.confirm(`Are you sure you want to delete goat ${name} (${tag})? This action cannot be undone.`);
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const goats = goatsQuery.data?.data ?? [];
  const meta = goatsQuery.data?.meta ?? { page: 1, limit: 10, totalRecords: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Goat Management</h1>
          <p className="mt-1 text-sm text-surface-700">Track registration, health, weights, and breed details.</p>
        </div>
        {isAdmin && (
          <Link
            to={ROUTES.CREATE_GOAT}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Register Goat
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tag or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-surface-200 bg-white pl-9 pr-4 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Breed Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">Breed</label>
              <input
                type="text"
                placeholder="e.g. Barbari, Sirohi..."
                value={breedFilter}
                onChange={(e) => setBreedFilter(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {/* Gender Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">Gender</label>
              <select
                value={selectedGender}
                onChange={(e) => {
                  setPage(1);
                  setSelectedGender(e.target.value);
                }}
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setPage(1);
                  setSelectedStatus(e.target.value);
                }}
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Sold">Sold</option>
                <option value="Dead">Dead</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-lg border border-surface-200 hover:bg-surface-50 px-4 py-2 text-xs font-bold text-surface-750 transition duration-150 cursor-pointer"
            >
              Clear Filters
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary-600 hover:bg-primary-700 px-5 py-2 text-xs font-bold text-white transition duration-150 cursor-pointer shadow-sm"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* List Container */}
      <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
        {goatsQuery.isLoading ? (
          <div className="divide-y divide-surface-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4">
                <div className="flex items-center gap-4 w-1/3">
                  <div className="h-10 w-10 bg-surface-200 rounded-full" />
                  <div className="h-4 bg-surface-200 rounded w-24" />
                </div>
                <div className="h-4 bg-surface-200 rounded w-16" />
                <div className="h-4 bg-surface-200 rounded w-20" />
                <div className="h-4 bg-surface-200 rounded w-12" />
              </div>
            ))}
          </div>
        ) : goatsQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-red-50 p-3 text-red-600 border border-red-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-surface-900">Failed to load goats</h3>
            <p className="mt-1 text-sm text-surface-700">{getErrorMessage(goatsQuery.error)}</p>
            <button
              onClick={() => goatsQuery.refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-650 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : goats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-surface-100 p-4 text-surface-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-surface-900">No goats found</h3>
            <p className="mt-1 text-sm text-surface-700">Try adjusting your search terms or filter criteria.</p>
            {isAdmin && (
              <Link
                to={ROUTES.CREATE_GOAT}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
              >
                Register a Goat
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">UID Tag</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Name</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Gender</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Breed</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Weight</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {goats.map((goat) => {
                  const statusColors = {
                    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Pregnant: 'bg-purple-50 text-purple-700 border-purple-200',
                    Sold: 'bg-blue-50 text-blue-700 border-blue-200',
                    Dead: 'bg-red-50 text-red-700 border-red-200',
                  };

                  return (
                    <tr key={goat._id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-surface-100 border border-surface-200 px-2.5 py-1 text-xs font-bold text-surface-800 uppercase">
                          {goat.uidTag}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-surface-950">
                        {goat.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-700">
                        <span className="inline-flex items-center gap-1">
                          {goat.gender === 'Male' ? (
                            <>
                              <svg className="h-4 w-4 text-blue-550" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0-5.656h5.656v5.656m-9.9 2.122a6.364 6.364 0 109 9 6.364 6.364 0 00-9-9z" />
                              </svg>
                              Male
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4 text-pink-550" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11a5 5 0 100-10 5 5 0 000 10zm0 0v12m-4-4h8" />
                              </svg>
                              Female
                            </>
                          )}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-700">
                        {goat.breed || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-700 font-medium">
                        {goat.currentWeight ? `${goat.currentWeight} kg` : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[goat.status] || 'bg-surface-50 text-surface-700 border-surface-200'}`}>
                          {goat.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          <Link
                            to={`/goats/${goat._id}`}
                            className="rounded-lg border border-surface-200 hover:bg-surface-100 hover:border-surface-300 text-surface-850 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                          >
                            View
                          </Link>
                          {isStaffOrAdmin && (
                            <Link
                              to={`/goats/${goat._id}/edit`}
                              className="rounded-lg border border-primary-200 hover:bg-primary-50 text-primary-750 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                            >
                              Edit
                            </Link>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(goat._id, goat.name, goat.uidTag)}
                              disabled={deleteMutation.isPending && deleteMutation.variables === goat._id}
                              className="rounded-lg border border-red-200 hover:bg-red-50 text-red-700 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                            >
                              {deleteMutation.isPending && deleteMutation.variables === goat._id ? 'Deleting...' : 'Delete'}
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

        {/* Pagination Footer */}
        {!goatsQuery.isLoading && !goatsQuery.isError && goats.length > 0 && (
          <div className="flex items-center justify-between border-t border-surface-200 bg-white px-6 py-4">
            <div className="text-xs text-surface-700">
              Showing <span className="font-semibold">{Math.min(meta.totalRecords, (page - 1) * limit + 1)}</span> to{' '}
              <span className="font-semibold">{Math.min(meta.totalRecords, page * limit)}</span> of{' '}
              <span className="font-semibold">{meta.totalRecords}</span> goats
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-750 px-3 text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-surface-700 font-semibold px-2">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-750 px-3 text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
