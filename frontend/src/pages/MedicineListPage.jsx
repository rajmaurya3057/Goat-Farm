import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { medicinesApi } from '../api/medicines.api';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/helpers';
import { ROUTES } from '../utils/constants';

export default function MedicineListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Active query parameters (updated on button click or change)
  const [querySearch, setQuerySearch] = useState('');

  // Fetch medicines list
  const medicinesQuery = useQuery({
    queryKey: [
      'medicines',
      { page, limit, search: querySearch, type: selectedType, status: selectedStatus },
    ],
    queryFn: async () => {
      const res = await medicinesApi.getMedicines({
        page,
        limit,
        search: querySearch || undefined,
        type: selectedType || undefined,
        status: selectedStatus || undefined,
      });
      return res.data;
    },
  });

  // Delete medicine mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await medicinesApi.deleteMedicine(id);
    },
    onSuccess: () => {
      toast.success('Medicine deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete medicine'));
    },
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setQuerySearch(searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
    setQuerySearch('');
    setPage(1);
  };

  const handleDelete = (id, name, batch) => {
    const batchLabel = batch ? ` (Batch: ${batch})` : '';
    const confirmed = window.confirm(
      `Are you sure you want to delete medicine ${name}${batchLabel}? This action cannot be undone.`
    );
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const medicines = medicinesQuery.data?.data ?? [];
  const meta = medicinesQuery.data?.meta ?? { page: 1, limit: 10, totalRecords: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Medicine Inventory</h1>
          <p className="mt-1 text-sm text-surface-700">
            Track medicine quantities, types, batch details, and expiry statuses.
          </p>
        </div>
        {isAdmin && (
          <Link
            to={ROUTES.CREATE_MEDICINE}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Register Medicine
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
                  placeholder="Name or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-surface-200 bg-white pl-9 pr-4 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">Type</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setPage(1);
                  setSelectedType(e.target.value);
                }}
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All Types</option>
                <option value="Injection">Injection</option>
                <option value="Oral Liquid">Oral Liquid</option>
                <option value="Powder">Powder</option>
                <option value="Tablet">Tablet</option>
                <option value="Bolus">Bolus</option>
                <option value="Topical">Topical</option>
                <option value="Vaccine">Vaccine</option>
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
                <option value="Available">Available</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out Of Stock">Out Of Stock</option>
                <option value="Expired">Expired</option>
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
        {medicinesQuery.isLoading ? (
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
        ) : medicinesQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-red-50 p-3 text-red-600 border border-red-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-surface-900">Failed to load medicines</h3>
            <p className="mt-1 text-sm text-surface-700">{getErrorMessage(medicinesQuery.error)}</p>
            <button
              onClick={() => medicinesQuery.refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-650 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : medicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-surface-100 p-4 text-surface-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-surface-900">No medicines found</h3>
            <p className="mt-1 text-sm text-surface-700">Try adjusting your search terms or filter criteria.</p>
            {isAdmin && (
              <Link
                to={ROUTES.CREATE_MEDICINE}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
              >
                Register a Medicine
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Medicine</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Type</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Quantity</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Batch Number</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Expiry Date</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-surface-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {medicines.map((med) => {
                  const statusColors = {
                    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Out Of Stock': 'bg-rose-50 text-rose-700 border-rose-200',
                    Expired: 'bg-red-50 text-red-700 border-red-200',
                  };

                  return (
                    <tr key={med._id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          {med.image ? (
                            <img
                              src={med.image}
                              alt={med.name}
                              className="h-10 w-10 rounded-lg object-cover border border-surface-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop';
                              }}
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100 border border-surface-200 text-surface-600">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104a.75.75 0 00-.75-.75H7.5a.75.75 0 000 1.5h.375v2.247a3.75 3.75 0 01-.777 2.302L3.89 12.827a5.25 5.25 0 00-.64 2.58v3.843A1.5 1.5 0 004.75 20.75h14.5a1.5 1.5 0 001.5-1.5v-3.843a5.25 5.25 0 00-.64-2.58l-3.208-4.428a3.75 3.75 0 01-.777-2.302V3.854h.375a.75.75 0 000-1.5h-1.5a.75.75 0 00-.75.75v3.197a1.5 1.5 0 00.31.92l3.209 4.428c.45.621.691 1.36.691 2.12v3.843H5.25v-3.843c0-.76.24-1.499.692-2.12l3.208-4.428a1.5 1.5 0 00.31-.92V3.104z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-surface-950">{med.name}</div>
                            {med.supplier && (
                              <div className="text-xs text-surface-550">Supplier: {med.supplier}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-700">
                        {med.type}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-900 font-semibold">
                        {med.quantity} <span className="text-xs text-surface-550 font-normal">{med.unit || 'units'}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-700">
                        {med.batchNumber || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-surface-700 font-medium">
                        {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            statusColors[med.status] || 'bg-surface-50 text-surface-700 border-surface-200'
                          }`}
                        >
                          {med.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          {isStaffOrAdmin && (
                            <Link
                              to={`/medicines/${med._id}/edit`}
                              className="rounded-lg border border-primary-200 hover:bg-primary-50 text-primary-750 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                            >
                              Edit
                            </Link>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(med._id, med.name, med.batchNumber)}
                              disabled={deleteMutation.isPending && deleteMutation.variables === med._id}
                              className="rounded-lg border border-red-200 hover:bg-red-50 text-red-700 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                            >
                              {deleteMutation.isPending && deleteMutation.variables === med._id ? 'Deleting...' : 'Delete'}
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
        {!medicinesQuery.isLoading && !medicinesQuery.isError && medicines.length > 0 && (
          <div className="flex items-center justify-between border-t border-surface-200 bg-white px-6 py-4">
            <div className="text-xs text-surface-700">
              Showing <span className="font-semibold">{Math.min(meta.totalRecords, (page - 1) * limit + 1)}</span> to{' '}
              <span className="font-semibold">{Math.min(meta.totalRecords, page * limit)}</span> of{' '}
              <span className="font-semibold">{meta.totalRecords}</span> medicines
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
