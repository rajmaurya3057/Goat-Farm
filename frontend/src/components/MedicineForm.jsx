import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

// Helper to format Date ISO string to YYYY-MM-DD for date input
function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export default function MedicineForm({ initialData, onSubmit, isSubmitting, submitLabel = 'Save' }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name ?? '',
      type: initialData?.type ?? '',
      quantity: initialData?.quantity ?? '',
      unit: initialData?.unit ?? '',
      batchNumber: initialData?.batchNumber ?? '',
      purchaseDate: initialData?.purchaseDate ? formatDateForInput(initialData.purchaseDate) : '',
      expiryDate: initialData?.expiryDate ? formatDateForInput(initialData.expiryDate) : '',
      supplier: initialData?.supplier ?? '',
      image: initialData?.image ?? '',
      notes: initialData?.notes ?? '',
    },
  });

  const purchaseDateValue = watch('purchaseDate');

  const onFormSubmit = (values) => {
    const payload = {
      name: values.name,
      type: values.type,
      quantity: parseFloat(values.quantity),
      expiryDate: new Date(values.expiryDate).toISOString(),

      ...(values.unit && { unit: values.unit }),
      ...(values.batchNumber && { batchNumber: values.batchNumber }),
      ...(values.supplier && { supplier: values.supplier }),
      ...(values.image && { image: values.image }),
      ...(values.notes && { notes: values.notes }),

      ...(values.purchaseDate && {
        purchaseDate: new Date(values.purchaseDate).toISOString(),
      }),
    };

    console.log('Submitting payload:', payload);
    onSubmit(payload);
  };

  const cancelPath = ROUTES.MEDICINES;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        {/* Form Grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">

          {/* Section: Basic Information */}
          <div className="sm:col-span-2 border-b border-surface-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Basic Information</h3>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Medicine Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Paracetamol, Ivermectin"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('name', {
                required: 'Medicine Name is required',
                validate: (v) => v.trim() !== '' || 'Medicine Name cannot be empty spaces',
              })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-650">{errors.name.message}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.type ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('type', { required: 'Type is required' })}
            >
              <option value="">Select Type</option>
              <option value="Injection">Injection</option>
              <option value="Oral Liquid">Oral Liquid</option>
              <option value="Powder">Powder</option>
              <option value="Tablet">Tablet</option>
              <option value="Bolus">Bolus</option>
              <option value="Topical">Topical</option>
              <option value="Vaccine">Vaccine</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-xs text-red-650">{errors.type.message}</p>
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
              step="any"
              placeholder="e.g. 10"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.quantity ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('quantity', {
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity cannot be negative' },
              })}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-650">{errors.quantity.message}</p>
            )}
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unit" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Unit
            </label>
            <input
              id="unit"
              type="text"
              placeholder="e.g. ml, vials, tablets"
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              {...register('unit')}
            />
          </div>

          {/* Section: Supply & Dates */}
          <div className="sm:col-span-2 border-b border-surface-200 pb-2 mt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Supply & Dates</h3>
          </div>

          {/* Batch Number */}
          <div>
            <label htmlFor="batchNumber" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Batch Number
            </label>
            <input
              id="batchNumber"
              type="text"
              placeholder="e.g. BATCH-1234"
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              {...register('batchNumber')}
            />
          </div>

          {/* Supplier */}
          <div>
            <label htmlFor="supplier" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Supplier
            </label>
            <input
              id="supplier"
              type="text"
              placeholder="e.g. Agri-Vet Pharmacy"
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              {...register('supplier')}
            />
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

          {/* Expiry Date */}
          <div>
            <label htmlFor="expiryDate" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              id="expiryDate"
              type="date"
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.expiryDate ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('expiryDate', {
                required: 'Expiry Date is required',
                validate: (v) => {
                  if (!v) return true;
                  if (!purchaseDateValue) return true;
                  return new Date(v) >= new Date(purchaseDateValue) || 'Expiry date must be after purchase date';
                },
              })}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-xs text-red-650">{errors.expiryDate.message}</p>
            )}
          </div>

          {/* Section: Additional Information */}
          <div className="sm:col-span-2 border-b border-surface-200 pb-2 mt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Additional Information</h3>
          </div>

          {/* Image URL */}
          <div className="sm:col-span-2">
            <label htmlFor="image" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Image URL
            </label>
            <input
              id="image"
              type="url"
              placeholder="e.g. https://images.unsplash.com/photo-..."
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${errors.image ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
              {...register('image', {
                pattern: {
                  value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                  message: 'Enter a valid URL',
                },
              })}
            />
            {errors.image && (
              <p className="mt-1 text-xs text-red-650">{errors.image.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
              Notes / Instructions
            </label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Storage instructions, dosage constraints, warnings..."
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
