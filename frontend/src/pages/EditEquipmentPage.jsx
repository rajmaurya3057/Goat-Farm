import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { equipmentApi } from '../api/equipment.api';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import EquipmentForm from '../components/EquipmentForm';

export default function EditEquipmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load current equipment details
  const equipmentQuery = useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const res = await equipmentApi.getEquipmentById(id);
      return res.data?.data;
    },
    enabled: Boolean(id),
  });

  // Update equipment mutation
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const res = await equipmentApi.updateEquipment(id, formData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Equipment updated successfully');
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', id] });
      navigate(ROUTES.EQUIPMENT);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update equipment'));
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate(formData);
  };

  if (equipmentQuery.isLoading) {
    return <LoadingSpinner label="Loading equipment details..." />;
  }

  if (equipmentQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-600 border border-red-100 shadow-sm">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-surface-900">Failed to Load Equipment Details</h3>
        <p className="mt-2 text-sm text-surface-700 max-w-md">
          {getErrorMessage(equipmentQuery.error)}
        </p>
        <div className="mt-6 flex gap-4">
          <Link
            to={ROUTES.EQUIPMENT}
            className="rounded-lg border border-surface-200 hover:bg-surface-555 text-surface-800 px-4 py-2 text-sm font-semibold transition"
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
        <p className="mt-2 text-sm text-surface-700 font-medium font-medium">The equipment record does not exist or has been deleted.</p>
        <Link
          to={ROUTES.EQUIPMENT}
          className="mt-6 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 text-sm font-semibold transition shadow-sm"
        >
          Back to Equipment List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header and Breadcrumbs */}
      <div className="border-b border-surface-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
          <Link to={ROUTES.EQUIPMENT} className="hover:text-primary-650 transition">
            Equipment
          </Link>
          <span>/</span>
          <span>Edit Equipment</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-surface-900">Edit {equipment.name}</h1>
        </div>
        <p className="mt-1 text-sm text-surface-700">
          Modify acquisition cost, quantities, status, category, storage location, or notes.
        </p>
      </div>

      {/* Form Wrapper */}
      <div className="mt-6">
        <EquipmentForm
          initialData={equipment}
          onSubmit={onSubmit}
          isSubmitting={mutation.isPending}
          submitLabel="Update Equipment"
        />
      </div>
    </div>
  );
}
