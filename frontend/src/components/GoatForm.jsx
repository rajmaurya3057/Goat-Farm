import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { goatsApi } from '../api/goats.api';
import { ROUTES } from '../utils/constants';

// Helper to format Date ISO string to YYYY-MM-DD for date input
function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export default function GoatForm({ initialData, onSubmit, isSubmitting, submitLabel = 'Save', goatId }) {
  // Query female goats for Mother field
  const { data: femalesData, isLoading: isLoadingFemales } = useQuery({
    queryKey: ['goats', { gender: 'Female', limit: 1000 }],
    queryFn: async () => {
      const res = await goatsApi.getGoats({ gender: 'Female', limit: 1000 });
      return res.data?.data ?? [];
    },
  });

  // Query male goats for Father field
  const { data: malesData, isLoading: isLoadingMales } = useQuery({
    queryKey: ['goats', { gender: 'Male', limit: 1000 }],
    queryFn: async () => {
      const res = await goatsApi.getGoats({ gender: 'Male', limit: 1000 });
      return res.data?.data ?? [];
    },
  });

  // Filter out current goat being edited from parent choices
  const femaleGoats = (femalesData ?? []).filter((g) => g._id !== goatId);
  const maleGoats = (malesData ?? []).filter((g) => g._id !== goatId);

  // Guarantee current parents are in lists even if not in first page results
  const femaleOptions = [...femaleGoats];
  if (initialData?.mother && typeof initialData.mother === 'object') {
    if (!femaleOptions.some((g) => g._id === initialData.mother._id)) {
      femaleOptions.push(initialData.mother);
    }
  }

  const maleOptions = [...maleGoats];
  if (initialData?.father && typeof initialData.father === 'object') {
    if (!maleOptions.some((g) => g._id === initialData.father._id)) {
      maleOptions.push(initialData.father);
    }
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      uidTag: initialData?.uidTag ?? '',
      name: initialData?.name ?? '',
      gender: initialData?.gender ?? '',
      breed: initialData?.breed ?? '',
      color: initialData?.color ?? '',
      dob: initialData?.dob ? formatDateForInput(initialData.dob) : '',
      currentWeight: initialData?.currentWeight ?? '',
      photo: initialData?.photo ?? '',
      status: initialData?.status ?? 'Active',
      mother: initialData?.mother?._id ?? initialData?.mother ?? '',
      father: initialData?.father?._id ?? initialData?.father ?? '',
      notes: initialData?.notes ?? '',
    },
  });

  const genderValue = watch('gender');
  const statusValue = watch('status');

  // Business logic: if gender is changed to Male and status is Pregnant, reset status to Active
  useEffect(() => {
    if (genderValue === 'Male' && statusValue === 'Pregnant') {
      setValue('status', 'Active');
    }
  }, [genderValue, statusValue, setValue]);

  const onFormSubmit = (values) => {
    const payload = {
      uidTag: values.uidTag,
      name: values.name,
      gender: values.gender,
      status: values.status,

      ...(values.breed && { breed: values.breed }),
      ...(values.color && { color: values.color }),
      ...(values.photo && { photo: values.photo }),
      ...(values.notes && { notes: values.notes }),

      ...(values.dob && {
        dob: new Date(values.dob).toISOString(),
      }),

      ...(values.currentWeight !== '' && {
        currentWeight: parseFloat(values.currentWeight),
      }),

      ...(values.mother && {
        mother: values.mother,
      }),

      ...(values.father && {
        father: values.father,
      }),
    };

    console.log('Submitting payload:', payload);
    onSubmit(payload);
  };

  const cancelPath = goatId ? `/goats/${goatId}` : ROUTES.GOATS;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        {/* Form Grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">

          {/* Section: Basic Information */}
          <div className="sm:col-span-2 border-b border-surface-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Basic Information</h3>
          </div>

          {/* UID Tag */}
          <div>
            <label htmlFor="uidTag" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              UID Tag <span className="text-red-500">*</span>
            </label>
            <input
              id="uidTag"
              type="text"
              placeholder="e.g. GT-001"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.uidTag ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('uidTag', {
                required: 'UID Tag is required',
                validate: (v) => v.trim() !== '' || 'UID Tag cannot be empty spaces',
              })}
            />
            {errors.uidTag && (
              <p className="mt-1 text-xs text-red-650">{errors.uidTag.message}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Goat Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Billy, Daisy"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('name', {
                required: 'Name is required',
                validate: (v) => v.trim() !== '' || 'Name cannot be empty spaces',
              })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-650">{errors.name.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.gender ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('gender', { required: 'Gender is required' })}
            >
              <option value="">Select Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-650">{errors.gender.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Status
            </label>
            <select
              id="status"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 border-surface-200 focus:border-primary-500`}
              {...register('status')}
            >
              <option value="Active">Active</option>
              {genderValue !== 'Male' && <option value="Pregnant">Pregnant</option>}
              <option value="Sold">Sold</option>
              <option value="Dead">Dead</option>
            </select>
          </div>

          {/* Section: Secondary details */}
          <div className="sm:col-span-2 border-b border-surface-200 pb-2 mt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Characteristics & Lineage</h3>
          </div>

          {/* Breed */}
          <div>
            <label htmlFor="breed" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Breed
            </label>
            <input
              id="breed"
              type="text"
              placeholder="e.g. Barbari, Jamnapari, Sirohi"
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              {...register('breed')}
            />
          </div>

          {/* Color */}
          <div>
            <label htmlFor="color" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Color/Markings
            </label>
            <input
              id="color"
              type="text"
              placeholder="e.g. Brown & White, Black"
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              {...register('color')}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.dob ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('dob', {
                validate: (v) => {
                  if (!v) return true;
                  const date = new Date(v);
                  const today = new Date();
                  today.setHours(23, 59, 59, 999); // Allow birth dates today
                  return date <= today || 'Date of birth cannot be in the future';
                },
              })}
            />
            {errors.dob && (
              <p className="mt-1 text-xs text-red-650">{errors.dob.message}</p>
            )}
          </div>

          {/* Current Weight */}
          <div>
            <label htmlFor="currentWeight" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Initial Weight (kg)
            </label>
            <input
              id="currentWeight"
              type="number"
              step="0.01"
              placeholder="e.g. 15.5"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.currentWeight ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('currentWeight', {
                min: { value: 0, message: 'Weight cannot be less than 0 kg' },
                max: { value: 300, message: 'Weight must be less than 300 kg' },
              })}
            />
            {errors.currentWeight && (
              <p className="mt-1 text-xs text-red-650">{errors.currentWeight.message}</p>
            )}
          </div>

          {/* Mother Selection */}
          <div>
            <label htmlFor="mother" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider flex justify-between items-center">
              <span>Mother</span>
              {isLoadingFemales && <span className="text-[10px] lowercase text-primary-600 animate-pulse">Loading...</span>}
            </label>
            <select
              id="mother"
              disabled={isLoadingFemales}
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-surface-50 disabled:text-surface-450"
              {...register('mother')}
            >
              <option value="">None / Unknown</option>
              {femaleOptions.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name} ({g.uidTag})
                </option>
              ))}
            </select>
          </div>

          {/* Father Selection */}
          <div>
            <label htmlFor="father" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider flex justify-between items-center">
              <span>Father</span>
              {isLoadingMales && <span className="text-[10px] lowercase text-primary-600 animate-pulse">Loading...</span>}
            </label>
            <select
              id="father"
              disabled={isLoadingMales}
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-surface-50 disabled:text-surface-450"
              {...register('father')}
            >
              <option value="">None / Unknown</option>
              {maleOptions.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name} ({g.uidTag})
                </option>
              ))}
            </select>
          </div>

          {/* Section: Additional Details */}
          <div className="sm:col-span-2 border-b border-surface-200 pb-2 mt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Additional Information</h3>
          </div>

          {/* Photo URL */}
          <div className="sm:col-span-2">
            <label htmlFor="photo" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Photo URL
            </label>
            <input
              id="photo"
              type="url"
              placeholder="e.g. https://images.unsplash.com/photo-..."
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              {...register('photo', {
                pattern: {
                  value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                  message: 'Enter a valid URL',
                },
              })}
            />
            {errors.photo && (
              <p className="mt-1 text-xs text-red-650">{errors.photo.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Notes / Remarks
            </label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Health status notes, parent history, physical anomalies..."
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
