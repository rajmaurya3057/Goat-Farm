import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { treatmentsApi } from '../api/treatments.api';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import TreatmentForm from '../components/TreatmentForm';

export default function EditTreatmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const treatmentQuery = useQuery({
    queryKey: ['treatment', id],
    queryFn: async () => {
      const res = await treatmentsApi.getTreatmentById(id);
      return res.data?.data;
    },
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const res = await treatmentsApi.updateTreatment(id, formData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Treatment record updated');
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['treatment', id] });
      navigate(ROUTES.TREATMENTS);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update treatment'));
    },
  });

  if (treatmentQuery.isLoading) return <LoadingSpinner label="Loading treatment details..." />;

  if (treatmentQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-600 border border-red-100 shadow-sm">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-surface-900">Failed to Load Treatment</h3>
        <p className="mt-2 text-sm text-surface-700 max-w-md">{getErrorMessage(treatmentQuery.error)}</p>
        <div className="mt-6 flex gap-4">
          <Link to={ROUTES.TREATMENTS} className="rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-800 px-4 py-2 text-sm font-semibold transition">Back to List</Link>
          <button onClick={() => treatmentQuery.refetch()} className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-sm font-semibold transition cursor-pointer">Retry</button>
        </div>
      </div>
    );
  }

  const treatmentData = treatmentQuery.data;
  const treatment = treatmentData?.treatment ?? treatmentData;

  if (!treatment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h3 className="text-lg font-bold text-surface-900">Treatment Not Found</h3>
        <p className="mt-2 text-sm text-surface-700">The record does not exist or has been deleted.</p>
        <Link to={ROUTES.TREATMENTS} className="mt-6 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 text-sm font-semibold transition shadow-sm">
          Back to Treatments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-surface-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
          <Link to={ROUTES.TREATMENTS} className="hover:text-primary-650 transition">Treatments</Link>
          <span>/</span>
          <span>Edit Record</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Edit Treatment: {treatment.disease}</h1>
        <p className="mt-1 text-sm text-surface-700">Update disease, medicine, or treatment date details.</p>
      </div>

      <div className="mt-6">
        <TreatmentForm
          initialData={treatment}
          onSubmit={(data) => mutation.mutate(data)}
          isSubmitting={mutation.isPending}
          submitLabel="Update Treatment"
        />
      </div>
    </div>
  );
}
