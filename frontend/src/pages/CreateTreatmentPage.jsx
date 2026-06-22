import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { treatmentsApi } from '../api/treatments.api';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import TreatmentForm from '../components/TreatmentForm';

export default function CreateTreatmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await treatmentsApi.createTreatment(data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Treatment record logged successfully');
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      navigate(ROUTES.TREATMENTS);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to log treatment'));
    },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-surface-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
          <Link to={ROUTES.TREATMENTS} className="hover:text-primary-650 transition">Treatments</Link>
          <span>/</span>
          <span>Log Treatment</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Log New Treatment</h1>
        <p className="mt-1 text-sm text-surface-700">
          Record a new medical treatment administered to a goat.
        </p>
      </div>

      <div className="mt-6">
        <TreatmentForm
          onSubmit={(data) => mutation.mutate(data)}
          isSubmitting={mutation.isPending}
          submitLabel="Log Treatment"
        />
      </div>
    </div>
  );
}
