import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

const CATEGORIES = [
  'Feeding Equipment',
  'Medical Equipment',
  'Cleaning Equipment',
  'Water Equipment',
  'Farm Machinery',
  'Electrical Equipment',
  'Other',
];

const STATUSES = ['Working', 'Under Maintenance', 'Non Working', 'Disposed'];

export default function EquipmentForm({ initialData, onSubmit, isSubmitting, submitLabel = 'Save' }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name ?? '',
      category: initialData?.category ?? '',
      quantity: initialData?.quantity ?? '',
      purchaseDate: initialData?.purchaseDate ? formatDateForInput(initialData.purchaseDate) : '',
      purchaseCost: initialData?.purchaseCost ?? '',
      status: initialData?.status ?? 'Working',
      photo: initialData?.photo ?? '',
      supplier: initialData?.supplier ?? '',
      location: initialData?.location ?? '',
      notes: initialData?.notes ?? '',
    },
  });

  const purchaseDateValue = watch('purchaseDate');

  const onFormSubmit = (values) => {
    const payload = {
      name: values.name.trim(),
      category: values.category,
      quantity: parseInt(values.quantity, 10),
      status: values.status,

      ...(values.photo && { photo: values.photo.trim() }),
      ...(values.supplier && { supplier: values.supplier.trim() }),
      ...(values.location && { location: values.location.trim() }),
      ...(values.notes && { notes: values.notes.trim() }),

      ...(values.purchaseCost !== '' && values.purchaseCost !== null && {
        purchaseCost: parseFloat(values.purchaseCost),
      }),
      ...(values.purchaseDate && {
        purchaseDate: new Date(values.purchaseDate).toISOString(),
      }),
    };

    console.log('Submitting payload:', payload);
    onSubmit(payload);
  };

  const cancelPath = ROUTES.EQUIPMENT;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        {/* Form Grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">

          {/* Section: Basic Information */}
          <div className="sm:col-span-2 border-b border-surface-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Basic Information</h3>
          </div>

          {/* Equipment Name */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Equipment Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Milking Machine, Feed Troughs"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('name', {
                required: 'Equipment Name is required',
                validate: (v) => v.trim() !== '' || 'Equipment Name cannot be empty spaces',
              })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-650">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.category ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('category', { required: 'Category is required' })}
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-650">{errors.category.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              placeholder="e.g. 5"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.quantity ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('quantity', {
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity cannot be negative' },
                validate: (v) => Number.isInteger(parseFloat(v)) || 'Quantity must be an integer',
              })}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-650">{errors.quantity.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.status ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('status', { required: 'Status is required' })}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-red-650">{errors.status.message}</p>
            )}
          </div>

          {/* Section: Acquisition & Cost */}
          <div className="sm:col-span-2 border-b border-surface-200 pb-2 mt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Acquisition & Supply</h3>
          </div>

          {/* Purchase Date */}
          <div>
            <label htmlFor="purchaseDate" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Purchase Date
            </label>
            <input
              id="purchaseDate"
              type="date"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 border-surface-200 focus:border-primary-500`}
              {...register('purchaseDate', {
                validate: (v) => {
                  if (!v) return true;
                  const date = new Date(v);
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  return date <= today || 'Purchase date cannot be in the future';
                },
              })}
            />
            {errors.purchaseDate && (
              <p className="mt-1 text-xs text-red-650">{errors.purchaseDate.message}</p>
            )}
          </div>

          {/* Purchase Cost */}
          <div>
            <label htmlFor="purchaseCost" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Purchase Cost
            </label>
            <input
              id="purchaseCost"
              type="number"
              step="any"
              placeholder="e.g. 1500.00"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.purchaseCost ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('purchaseCost', {
                min: { value: 0, message: 'Cost cannot be negative' },
              })}
            />
            {errors.purchaseCost && (
              <p className="mt-1 text-xs text-red-650">{errors.purchaseCost.message}</p>
            )}
          </div>

          {/* Supplier */}
          <div>
            <label htmlFor="supplier" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Supplier
            </label>
            <input
              id="supplier"
              type="text"
              placeholder="e.g. FarmTech Solutions"
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              {...register('supplier')}
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Storage / Usage Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g. Barn A, Main Office Shed"
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              {...register('location')}
            />
          </div>

          {/* Section: Additional Information */}
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
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.photo ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
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
              placeholder="Maintenance instructions, serial numbers, warnings..."
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
