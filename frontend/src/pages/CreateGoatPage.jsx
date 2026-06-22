import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { goatsApi } from '../api/goats.api';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import GoatForm from '../components/GoatForm';

export default function CreateGoatPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await goatsApi.createGoat(data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Goat registered successfully');
      queryClient.invalidateQueries({ queryKey: ['goats'] });
      navigate(ROUTES.GOATS);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to register goat'));
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
          <Link to={ROUTES.GOATS} className="hover:text-primary-650 transition">
            Goats
          </Link>
          <span>/</span>
          <span>Register Goat</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Register New Goat</h1>
        <p className="mt-1 text-sm text-surface-700">
          Add a new goat to the farm inventory. Fill in all the details below.
        </p>
      </div>

      {/* Form Wrapper */}
      <div className="mt-6">
        <GoatForm
          onSubmit={onSubmit}
          isSubmitting={mutation.isPending}
          submitLabel="Register Goat"
        />
      </div>
    </div>
  );
}