import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { equipmentApi } from '../api/equipment.api';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/helpers';
import { ROUTES } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ViewEquipmentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch equipment details
  const equipmentQuery = useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const res = await equipmentApi.getEquipmentById(id);
      return res.data?.data;
    },
    enabled: Boolean(id),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await equipmentApi.deleteEquipment(id);
    },
    onSuccess: () => {
      toast.success('Equipment deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
      navigate(ROUTES.EQUIPMENT);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete equipment'));
    },
  });

  const handleDelete = () => {
    const name = equipmentQuery.data?.equipment?.name || 'this equipment';
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`);
    if (confirmed) {
      deleteMutation.mutate();
    }
  };

  if (equipmentQuery.isLoading) {
    return <LoadingSpinner label="Loading equipment profile..." />;
  }

  if (equipmentQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-600 border border-red-100 shadow-sm">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-surface-900">Equipment Profile Unavailable</h3>
        <p className="mt-2 text-sm text-surface-700 max-w-md">{getErrorMessage(equipmentQuery.error)}</p>
        <div className="mt-6 flex gap-4">
          <Link
            to={ROUTES.EQUIPMENT}
            className="rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-800 px-4 py-2 text-sm font-semibold transition"
          >
            Back to List
          </Link>
          <button
            onClick={() => equipmentQuery.refetch()}
            className="rounded-lg bg-red-650 hover:bg-red-700 text-white px-5 py-2 text-sm font-semibold transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const equipmentData = equipmentQuery.data;
  const equipment = equipmentData?.equipment;

  if (!equipment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h3 className="text-lg font-bold text-surface-900">Equipment Not Found</h3>
        <p className="mt-2 text-sm text-surface-700 font-medium">The equipment record does not exist or has been deleted.</p>
        <Link
          to={ROUTES.EQUIPMENT}
          className="mt-6 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 text-sm font-semibold transition shadow-sm"
        >
          Back to Equipment List
        </Link>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const statusColors = {
    Working: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Under Maintenance': 'bg-amber-50 text-amber-700 border-amber-200',
    'Non Working': 'bg-red-50 text-red-700 border-red-200',
    Disposed: 'bg-surface-100 text-surface-700 border-surface-200',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
            <Link to={ROUTES.EQUIPMENT} className="hover:text-primary-650 transition">Equipment</Link>
            <span>/</span>
            <span>Profile</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-900">{equipment.name}</h1>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[equipment.status] || 'bg-surface-50 text-surface-700 border-surface-200'
                }`}
            >
              {equipment.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {isStaffOrAdmin && (
            <Link
              to={`/equipment/${equipment._id}/edit`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary-200 bg-white hover:bg-primary-50 text-primary-750 px-4 py-2 text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Details
            </Link>
          )}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50/50 text-red-700 px-4 py-2 text-sm font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Equipment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Picture and main details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm flex flex-col items-center">
            {equipment.photo ? (
              <img
                src={equipment.photo}
                alt={equipment.name}
                className="w-full h-56 rounded-lg object-cover border border-surface-200 shadow-inner mb-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop';
                }}
              />
            ) : (
              <div className="w-full h-56 rounded-lg bg-surface-50 border border-surface-200 text-surface-400 flex items-center justify-center mb-4">
                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </div>
            )}
            <h2 className="text-lg font-bold text-surface-900 text-center">{equipment.name}</h2>
            <p className="text-sm text-surface-600 font-medium mt-1">{equipment.category}</p>
          </div>
        </div>

        {/* Right 2 Columns: Structured Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-surface-50 border-b border-surface-200 px-6 py-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">General Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Category</dt>
                <dd className="mt-1 text-sm font-medium text-surface-900">{equipment.category}</dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Current Quantity</dt>
                <dd className="mt-1 text-sm font-bold text-surface-900">{equipment.quantity} units</dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[equipment.status] || 'bg-surface-50 text-surface-700 border-surface-200'
                      }`}
                  >
                    {equipment.status}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Location</dt>
                <dd className="mt-1 text-sm font-medium text-surface-900">{equipment.location || '—'}</dd>
              </div>
            </div>
          </div>

          {/* Procurement & Supplier Card */}
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-surface-50 border-b border-surface-200 px-6 py-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Acquisition & Procurement</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Purchase Date</dt>
                <dd className="mt-1 text-sm font-medium text-surface-900">
                  {equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Purchase Cost</dt>
                <dd className="mt-1 text-sm font-bold text-surface-900">
                  {equipment.purchaseCost !== undefined && equipment.purchaseCost !== null ? `₹${equipment.purchaseCost.toFixed(2)}` : '—'}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Supplier / Vendor</dt>
                <dd className="mt-1 text-sm font-medium text-surface-900">{equipment.supplier || '—'}</dd>
              </div>
            </div>
          </div>

          {/* Notes and Audit Timestamps */}
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-surface-50 border-b border-surface-200 px-6 py-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Additional Remarks & Audit</h3>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Notes & Remarks</dt>
                <dd className="mt-1.5 text-sm text-surface-750 bg-surface-50 rounded-lg p-3 border border-surface-150 whitespace-pre-line leading-relaxed">
                  {equipment.notes || 'No custom notes logged for this equipment.'}
                </dd>
              </div>

              <div className="border-t border-surface-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 text-xs text-surface-500">
                <div>
                  <span className="font-semibold uppercase tracking-wider block">Created Date</span>
                  <span className="mt-0.5 block font-medium">
                    {equipment.createdAt ? new Date(equipment.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-wider block">Last Updated Date</span>
                  <span className="mt-0.5 block font-medium">
                    {equipment.updatedAt ? new Date(equipment.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
