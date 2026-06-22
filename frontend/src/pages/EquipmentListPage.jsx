import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { equipmentApi } from '../api/equipment.api';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/helpers';
import { ROUTES } from '../utils/constants';

const CATEGORIES = [
  'Feeding Equipment',
  'Medical Equipment',
  'Cleaning Equipment',
  'Water Equipment',
  'Farm Machinery',
  'Electrical Equipment',
  'Other',
];

const STATUSES = ['Working', 'Under Maintenance', 'Non Working', 'Disposed'];

export default function EquipmentListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Active search query
  const [querySearch, setQuerySearch] = useState('');

  // Fetch equipment list
  const equipmentQuery = useQuery({
    queryKey: [
      'equipments',
      { page, limit, search: querySearch, category: selectedCategory, status: selectedStatus },
    ],
    queryFn: async () => {
      const res = await equipmentApi.getEquipments({
        page,
        limit,
        search: querySearch || undefined,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined,
      });
      return res.data;
    },
  });

  // Delete equipment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await equipmentApi.deleteEquipment(id);
    },
    onSuccess: () => {
      toast.success('Equipment deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete equipment'));
    },
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setQuerySearch(searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setQuerySearch('');
    setPage(1);
  };

  const handleDelete = (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete equipment "${name}"? This action cannot be undone.`
    );
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const equipments = equipmentQuery.data?.data ?? [];
  const meta = equipmentQuery.data?.meta ?? { page: 1, limit: 10, totalRecords: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Equipment Inventory</h1>
          <p className="mt-1 text-sm text-surface-700">
            Track farm machinery, feeding troughs, medical tools, and other utility equipment.
          </p>
        </div>
        {isAdmin && (
          <Link
            to={ROUTES.CREATE_EQUIPMENT}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Equipment
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Search */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Equipment name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-surface-200 bg-white pl-9 pr-4 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setPage(1);
                  setSelectedCategory(e.target.value);
                }}
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
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
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-lg border border-surface-200 hover:bg-surface-555 px-4 py-2 text-xs font-bold text-surface-750 transition duration-150 cursor-pointer"
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
        {equipmentQuery.isLoading ? (
          <div className="divide-y divide-surface-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4">
                <div className="flex items-center gap-4 w-1/3">
                  <div className="h-10 w-10 bg-surface-200 rounded-lg" />
                  <div className="h-4 bg-surface-200 rounded w-24" />
                </div>
                <div className="h-4 bg-surface-200 rounded w-16" />
                <div className="h-4 bg-surface-200 rounded w-20" />
                <div className="h-4 bg-surface-200 rounded w-12" />
              </div>
            ))}
          </div>
        ) : equipmentQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-red-50 p-3 text-red-600 border border-red-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-surface-900">Failed to load equipment</h3>
            <p className="mt-1 text-sm text-surface-700">{getErrorMessage(equipmentQuery.error)}</p>
            <button
              onClick={() => equipmentQuery.refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-650 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : equipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-surface-100 p-4 text-surface-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.822 4.492L12.5 15.67a2.25 2.25 0 01-3.182-3.182l4.428-4.428A4.5 4.5 0 0118.25 3.25c1.19 0 2.274.463 3.084 1.218A1.5 1.5 0 0021.75 6.75zM12.5 15.67l-6 6A1.5 1.5 0 014.28 19.46l6-6" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-surface-900">No equipment found</h3>
            <p className="mt-1 text-sm text-surface-700">Try adjusting your search terms or filter criteria.</p>
            {isAdmin && (
              <Link
                to={ROUTES.CREATE_EQUIPMENT}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
              >
                Add Equipment
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Equipment</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Category</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Quantity</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Purchase Cost</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Purchase Date</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {equipments.map((eq) => {
                  const statusColors = {
                    Working: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'Under Maintenance': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Non Working': 'bg-red-50 text-red-700 border-red-200',
                    Disposed: 'bg-surface-100 text-surface-700 border-surface-200',
                  };

                  return (
                    <tr key={eq._id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          {eq.photo ? (
                            <img
                              src={eq.photo}
                              alt={eq.name}
                              className="h-10 w-10 rounded-lg object-cover border border-surface-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop';
                              }}
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100 border border-surface-200 text-surface-600">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-surface-950">{eq.name}</div>
                            {eq.location && (
                              <div className="text-xs text-surface-550">Location: {eq.location}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-700">
                        {eq.category}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-900 font-semibold">
                        {eq.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            statusColors[eq.status] || 'bg-surface-50 text-surface-700 border-surface-200'
                          }`}
                        >
                          {eq.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-900 font-semibold">
                        {eq.purchaseCost !== undefined && eq.purchaseCost !== null ? `₹${eq.purchaseCost.toFixed(2)}` : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-700">
                        {eq.purchaseDate ? new Date(eq.purchaseDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          <Link
                            to={`/equipment/${eq._id}`}
                            className="rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-750 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                          >
                            View
                          </Link>
                          {isStaffOrAdmin && (
                            <Link
                              to={`/equipment/${eq._id}/edit`}
                              className="rounded-lg border border-primary-200 hover:bg-primary-50 text-primary-750 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                            >
                              Edit
                            </Link>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(eq._id, eq.name)}
                              disabled={deleteMutation.isPending && deleteMutation.variables === eq._id}
                              className="rounded-lg border border-red-200 hover:bg-red-50 text-red-700 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                            >
                              {deleteMutation.isPending && deleteMutation.variables === eq._id ? 'Deleting...' : 'Delete'}
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
        {!equipmentQuery.isLoading && !equipmentQuery.isError && equipments.length > 0 && (
          <div className="flex items-center justify-between border-t border-surface-200 bg-white px-6 py-4">
            <div className="text-xs text-surface-700">
              Showing <span className="font-semibold">{Math.min(meta.totalRecords, (page - 1) * limit + 1)}</span> to{' '}
              <span className="font-semibold">{Math.min(meta.totalRecords, page * limit)}</span> of{' '}
              <span className="font-semibold">{meta.totalRecords}</span> equipment records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-555 px-3 text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-surface-700 font-semibold px-2">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-555 px-3 text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
