import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { medicinesApi } from '../api/medicines.api';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import MedicineForm from '../components/MedicineForm';

export default function CreateMedicinePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await medicinesApi.createMedicine(data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Medicine registered successfully');
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      navigate(ROUTES.MEDICINES);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to register medicine'));
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header and Breadcrumbs */}
      <div className="border-b border-surface-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
          <Link to={ROUTES.MEDICINES} className="hover:text-primary-650 transition">
            Medicines
          </Link>
          <span>/</span>
          <span>Register Medicine</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Register New Medicine</h1>
        <p className="mt-1 text-sm text-surface-700">
          Add a new medicine batch to the farm inventory. Fill in all the details below.
        </p>
      </div>

      {/* Form Wrapper */}
      <div className="mt-6">
        <MedicineForm
          onSubmit={onSubmit}
          isSubmitting={mutation.isPending}
          submitLabel="Register Medicine"
        />
      </div>
    </div>
  );
}
