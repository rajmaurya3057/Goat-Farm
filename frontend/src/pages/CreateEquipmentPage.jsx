import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { equipmentApi } from '../api/equipment.api';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import EquipmentForm from '../components/EquipmentForm';

export default function CreateEquipmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await equipmentApi.createEquipment(data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Equipment registered successfully');
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
      navigate(ROUTES.EQUIPMENT);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to register equipment'));
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
          <Link to={ROUTES.EQUIPMENT} className="hover:text-primary-650 transition">
            Equipment
          </Link>
          <span>/</span>
          <span>Register Equipment</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Register New Equipment</h1>
        <p className="mt-1 text-sm text-surface-700">
          Add new farm equipment, machinery, or supplies to the inventory.
        </p>
      </div>

      {/* Form Wrapper */}
      <div className="mt-6">
        <EquipmentForm
          onSubmit={onSubmit}
          isSubmitting={mutation.isPending}
          submitLabel="Register Equipment"
        />
      </div>
    </div>
  );
}
