import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { vaccinationsApi } from '../api/vaccinations.api';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import VaccinationForm from '../components/VaccinationForm';

export default function CreateVaccinationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await vaccinationsApi.createVaccination(data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Vaccination record logged successfully');
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      navigate(ROUTES.VACCINATIONS);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to log vaccination'));
    },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-surface-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
          <Link to={ROUTES.VACCINATIONS} className="hover:text-primary-650 transition">Vaccinations</Link>
          <span>/</span>
          <span>Log Vaccination</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Log New Vaccination</h1>
        <p className="mt-1 text-sm text-surface-700">
          Record a new vaccination administered to a goat.
        </p>
      </div>

      <div className="mt-6">
        <VaccinationForm
          onSubmit={(data) => mutation.mutate(data)}
          isSubmitting={mutation.isPending}
          submitLabel="Log Vaccination"
        />
      </div>
    </div>
  );
}
