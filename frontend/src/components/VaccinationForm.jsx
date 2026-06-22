import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { goatsApi } from '../api/goats.api';
import { ROUTES } from '../utils/constants';

function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export default function VaccinationForm({ initialData, onSubmit, isSubmitting, submitLabel = 'Save', vaccinationId }) {
  const { data: goatsData, isLoading: isLoadingGoats } = useQuery({
    queryKey: ['goats', { limit: 1000 }],
    queryFn: async () => {
      const res = await goatsApi.getGoats({ limit: 1000 });
      return res.data?.data ?? [];
    },
  });

  const goats = goatsData ?? [];

  // If initialData contains a populated goat object, ensure it's in the select choices
  const goatOptions = [...goats];
  if (initialData?.goat && typeof initialData.goat === 'object') {
    if (!goatOptions.some((g) => g._id === initialData.goat._id)) {
      goatOptions.push(initialData.goat);
    }
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      goat: initialData?.goat?._id ?? initialData?.goat ?? '',
      vaccineName: initialData?.vaccineName ?? '',
      dateGiven: initialData?.dateGiven ? formatDateForInput(initialData.dateGiven) : '',
      nextDueDate: initialData?.nextDueDate ? formatDateForInput(initialData.nextDueDate) : '',
      veterinarian: initialData?.veterinarian ?? '',
      notes: initialData?.notes ?? '',
    },
  });

  const dateGivenValue = watch('dateGiven');

  const onFormSubmit = (values) => {
    const payload = {
      goat: values.goat,
      vaccineName: values.vaccineName,
      dateGiven: new Date(values.dateGiven).toISOString(),
      nextDueDate: new Date(values.nextDueDate).toISOString(),
      ...(values.veterinarian && { veterinarian: values.veterinarian }),
      ...(values.notes && { notes: values.notes }),
    };

    console.log('Submitting vaccination payload:', payload);
    onSubmit(payload);
  };

  const cancelPath = ROUTES.VACCINATIONS;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        {/* Form Grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">

          {/* Section: Basic Information */}
          <div className="sm:col-span-2 border-b border-surface-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Vaccination Details</h3>
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

          {/* Vaccine Name */}
          <div>
            <label htmlFor="vaccineName" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Vaccine Name <span className="text-red-500">*</span>
            </label>
            <input
              id="vaccineName"
              type="text"
              placeholder="e.g. PPR Vaccine, Anthrax"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.vaccineName ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('vaccineName', {
                required: 'Vaccine Name is required',
                validate: (v) => v.trim() !== '' || 'Vaccine Name cannot be empty spaces',
              })}
            />
            {errors.vaccineName && (
              <p className="mt-1 text-xs text-red-650">{errors.vaccineName.message}</p>
            )}
          </div>

          {/* Date Given */}
          <div>
            <label htmlFor="dateGiven" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Date Given <span className="text-red-500">*</span>
            </label>
            <input
              id="dateGiven"
              type="date"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.dateGiven ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('dateGiven', {
                required: 'Date Given is required',
                validate: (v) => {
                  if (!v) return true;
                  const date = new Date(v);
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  return date <= today || 'Date given cannot be in the future';
                },
              })}
            />
            {errors.dateGiven && (
              <p className="mt-1 text-xs text-red-650">{errors.dateGiven.message}</p>
            )}
          </div>

          {/* Next Due Date */}
          <div>
            <label htmlFor="nextDueDate" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Next Due Date <span className="text-red-500">*</span>
            </label>
            <input
              id="nextDueDate"
              type="date"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.nextDueDate ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('nextDueDate', {
                required: 'Next Due Date is required',
                validate: (v) => {
                  if (!v) return true;
                  if (!dateGivenValue) return true;
                  return new Date(v) > new Date(dateGivenValue) || 'Next due date must be after date given';
                },
              })}
            />
            {errors.nextDueDate && (
              <p className="mt-1 text-xs text-red-650">{errors.nextDueDate.message}</p>
            )}
          </div>

          {/* Veterinarian */}
          <div className="sm:col-span-2">
            <label htmlFor="veterinarian" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Veterinarian
            </label>
            <input
              id="veterinarian"
              type="text"
              placeholder="e.g. Dr. Jane Smith"
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              {...register('veterinarian')}
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Dosage, batch, reaction, booster info..."
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
