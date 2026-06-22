import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { goatsApi } from '../api/goats.api';
import { medicinesApi } from '../api/medicines.api';
import { ROUTES } from '../utils/constants';

function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export default function TreatmentForm({ initialData, onSubmit, isSubmitting, submitLabel = 'Save' }) {
  const { data: goatsData, isLoading: isLoadingGoats } = useQuery({
    queryKey: ['goats', { limit: 1000 }],
    queryFn: async () => {
      const res = await goatsApi.getGoats({ limit: 1000 });
      return res.data?.data ?? [];
    },
  });

  const { data: medicinesData, isLoading: isLoadingMedicines } = useQuery({
    queryKey: ['medicines', { limit: 1000 }],
    queryFn: async () => {
      const res = await medicinesApi.getMedicines({ limit: 1000, status: 'Available' });
      return res.data?.data ?? [];
    },
  });

  const goats = goatsData ?? [];
  const medicines = medicinesData ?? [];

  const goatOptions = [...goats];
  if (initialData?.goat && typeof initialData.goat === 'object') {
    if (!goatOptions.some((g) => g._id === initialData.goat._id)) {
      goatOptions.push(initialData.goat);
    }
  }

  const medicineOptions = [...medicines];
  if (initialData?.medicine && typeof initialData.medicine === 'object') {
    if (!medicineOptions.some((m) => m._id === initialData.medicine._id)) {
      medicineOptions.push(initialData.medicine);
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      goat: initialData?.goat?._id ?? initialData?.goat ?? '',
      medicine: initialData?.medicine?._id ?? initialData?.medicine ?? '',
      disease: initialData?.disease ?? '',
      treatmentDate: initialData?.treatmentDate ? formatDateForInput(initialData.treatmentDate) : '',
      notes: initialData?.notes ?? '',
    },
  });

  const onFormSubmit = (values) => {
    const payload = {
      goat: values.goat,
      medicine: values.medicine,
      disease: values.disease,
      treatmentDate: new Date(values.treatmentDate).toISOString(),
      ...(values.notes && { notes: values.notes }),
    };

    console.log('Submitting treatment payload:', payload);
    onSubmit(payload);
  };

  const cancelPath = ROUTES.TREATMENTS;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">

          {/* Section Header */}
          <div className="sm:col-span-2 border-b border-surface-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Treatment Details</h3>
          </div>

          {/* Goat Selection */}
          <div>
            <label htmlFor="goat" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider flex justify-between items-center">
              <span>Goat <span className="text-red-500">*</span></span>
              {isLoadingGoats && <span className="text-[10px] lowercase text-primary-600 animate-pulse">Loading...</span>}
            </label>
            <select
              id="goat"
              disabled={isLoadingGoats}
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 disabled:bg-surface-50 ${errors.goat ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('goat', { required: 'Goat is required' })}
            >
              <option value="">Select Goat</option>
              {goatOptions.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name} ({g.uidTag})
                </option>
              ))}
            </select>
            {errors.goat && (
              <p className="mt-1 text-xs text-red-650">{errors.goat.message}</p>
            )}
          </div>

          {/* Medicine Selection */}
          <div>
            <label htmlFor="medicine" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider flex justify-between items-center">
              <span>Medicine <span className="text-red-500">*</span></span>
              {isLoadingMedicines && <span className="text-[10px] lowercase text-primary-600 animate-pulse">Loading...</span>}
            </label>
            <select
              id="medicine"
              disabled={isLoadingMedicines}
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 disabled:bg-surface-50 ${errors.medicine ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('medicine', { required: 'Medicine is required' })}
            >
              <option value="">Select Medicine</option>
              {medicineOptions.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.type}){m.quantity !== undefined ? ` — Qty: ${m.quantity}` : ''}
                </option>
              ))}
            </select>
            {errors.medicine && (
              <p className="mt-1 text-xs text-red-650">{errors.medicine.message}</p>
            )}
          </div>

          {/* Disease */}
          <div>
            <label htmlFor="disease" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Disease / Condition <span className="text-red-500">*</span>
            </label>
            <input
              id="disease"
              type="text"
              placeholder="e.g. Foot and Mouth, Bloat"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.disease ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('disease', {
                required: 'Disease is required',
                validate: (v) => v.trim() !== '' || 'Disease cannot be empty spaces',
              })}
            />
            {errors.disease && (
              <p className="mt-1 text-xs text-red-650">{errors.disease.message}</p>
            )}
          </div>

          {/* Treatment Date */}
          <div>
            <label htmlFor="treatmentDate" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Treatment Date <span className="text-red-500">*</span>
            </label>
            <input
              id="treatmentDate"
              type="date"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.treatmentDate ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('treatmentDate', {
                required: 'Treatment Date is required',
                validate: (v) => {
                  if (!v) return true;
                  const date = new Date(v);
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  return date <= today || 'Treatment date cannot be in the future';
                },
              })}
            />
            {errors.treatmentDate && (
              <p className="mt-1 text-xs text-red-650">{errors.treatmentDate.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Notes / Observations
            </label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Dosage given, reaction, follow-up instructions..."
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-y"
              {...register('notes')}
            />
          </div>

        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex justify-end items-center gap-3">
        <Link
          to={cancelPath}
          className="rounded-lg border border-surface-200 hover:bg-surface-100 text-surface-800 px-5 py-2 text-sm font-semibold transition cursor-pointer"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 text-sm font-semibold shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
