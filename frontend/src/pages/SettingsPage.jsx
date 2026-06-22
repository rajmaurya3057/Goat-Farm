import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { settingsApi } from '../api/settings.api';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';

  // ── Fetch Settings ──────────────────────────────────────────────────
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsApi.getSettings();
      return res.data?.data;
    },
  });

  // ── Form Setup ──────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      farmName: '',
      ownerName: '',
      phone: '',
      email: '',
      address: '',
      logo: '',
      description: '',
      establishedYear: '',
      notes: '',
    },
  });

  // Populate form once data loads
  useEffect(() => {
    if (settingsQuery.data) {
      const s = settingsQuery.data;
      reset({
        farmName: s.farmName ?? '',
        ownerName: s.ownerName ?? '',
        phone: s.phone ?? '',
        email: s.email ?? '',
        address: s.address ?? '',
        logo: s.logo ?? '',
        description: s.description ?? '',
        establishedYear: s.establishedYear ?? '',
        notes: s.notes ?? '',
      });
    }
  }, [settingsQuery.data, reset]);

  // ── Update Mutation ──────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await settingsApi.updateSettings(data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Farm settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to save settings'));
    },
  });

  const onSubmit = (values) => {
    const payload = {
      farmName: values.farmName.trim(),
      ...(values.ownerName && { ownerName: values.ownerName.trim() }),
      ...(values.phone && { phone: values.phone.trim() }),
      ...(values.email && { email: values.email.trim().toLowerCase() }),
      ...(values.address && { address: values.address.trim() }),
      ...(values.logo && { logo: values.logo.trim() }),
      ...(values.description && { description: values.description.trim() }),
      ...(values.establishedYear !== '' && values.establishedYear !== null && {
        establishedYear: parseInt(values.establishedYear, 10),
      }),
      ...(values.notes && { notes: values.notes.trim() }),
    };
    mutation.mutate(payload);
  };

  const logoValue = watch('logo');

  // ── Loading / Error States ───────────────────────────────────────────
  if (settingsQuery.isLoading) {
    return <LoadingSpinner label="Loading farm settings..." />;
  }

  if (settingsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-600 border border-red-100 shadow-sm">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-surface-900">Failed to Load Settings</h3>
        <p className="mt-2 text-sm text-surface-700 max-w-md">{getErrorMessage(settingsQuery.error)}</p>
        <button
          onClick={() => settingsQuery.refetch()}
          className="mt-6 rounded-lg bg-red-650 hover:bg-red-700 text-white px-5 py-2 text-sm font-semibold transition cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="border-b border-surface-200 pb-4">
        <h1 className="text-2xl font-bold text-surface-900">Farm Settings</h1>
        <p className="mt-1 text-sm text-surface-700">
          Manage farm profile, contact information, branding, and general configuration.
          {!isAdmin && (
            <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 text-xs font-semibold">
              View Only — Admin access required to edit
            </span>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Section 1: Farm Information ─────────────────────────── */}
        <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="border-b border-surface-200 pb-3 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-surface-800">Farm Information</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">

            {/* Farm Name */}
            <div className="sm:col-span-2">
              <label htmlFor="farmName" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                Farm Name <span className="text-red-500">*</span>
              </label>
              <input
                id="farmName"
                type="text"
                placeholder="e.g. Al Noor Goat Farm"
                disabled={!isAdmin}
                className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 disabled:bg-surface-50 disabled:cursor-not-allowed ${
                  errors.farmName ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
                {...register('farmName', {
                  required: 'Farm Name is required',
                  validate: (v) => v.trim() !== '' || 'Farm Name cannot be empty spaces',
                })}
              />
              {errors.farmName && (
                <p className="mt-1 text-xs text-red-650">{errors.farmName.message}</p>
              )}
            </div>

            {/* Owner Name */}
            <div>
              <label htmlFor="ownerName" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                Owner Name
              </label>
              <input
                id="ownerName"
                type="text"
                placeholder="e.g. Mohammed Al Noor"
                disabled={!isAdmin}
                className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-surface-50 disabled:cursor-not-allowed"
                {...register('ownerName')}
              />
            </div>

            {/* Established Year */}
            <div>
              <label htmlFor="establishedYear" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                Established Year
              </label>
              <input
                id="establishedYear"
                type="number"
                placeholder={`e.g. ${new Date().getFullYear() - 5}`}
                disabled={!isAdmin}
                className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 disabled:bg-surface-50 disabled:cursor-not-allowed ${
                  errors.establishedYear ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
                {...register('establishedYear', {
                  min: { value: 1800, message: 'Year must be 1800 or later' },
                  max: { value: new Date().getFullYear(), message: `Year cannot exceed ${new Date().getFullYear()}` },
                  validate: (v) => {
                    if (!v && v !== 0) return true;
                    return Number.isInteger(parseFloat(v)) || 'Must be a valid year';
                  },
                })}
              />
              {errors.establishedYear && (
                <p className="mt-1 text-xs text-red-650">{errors.establishedYear.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 2: Contact Information ──────────────────────── */}
        <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="border-b border-surface-200 pb-3 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-surface-800">Contact Information</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="e.g. +91 9876543210"
                disabled={!isAdmin}
                className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 disabled:bg-surface-50 disabled:cursor-not-allowed ${
                  errors.phone ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
                {...register('phone', {
                  pattern: {
                    value: /^[+\d\s\-().]{6,20}$/,
                    message: 'Invalid phone number format',
                  },
                })}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-650">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="e.g. farm@example.com"
                disabled={!isAdmin}
                className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 disabled:bg-surface-50 disabled:cursor-not-allowed ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
                {...register('email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-650">{errors.email.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label htmlFor="address" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                placeholder="e.g. Village Road, District, State, PIN - 123456"
                disabled={!isAdmin}
                className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-y disabled:bg-surface-50 disabled:cursor-not-allowed"
                {...register('address')}
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: Branding ─────────────────────────────────── */}
        <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="border-b border-surface-200 pb-3 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-surface-800">Branding</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">

            {/* Logo URL */}
            <div className="sm:col-span-2">
              <label htmlFor="logo" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                Logo URL
              </label>
              <input
                id="logo"
                type="url"
                placeholder="e.g. https://example.com/farm-logo.png"
                disabled={!isAdmin}
                className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 disabled:bg-surface-50 disabled:cursor-not-allowed ${
                  errors.logo ? 'border-red-300 focus:border-red-500' : 'border-surface-200 focus:border-primary-500'
                }`}
                {...register('logo', {
                  pattern: {
                    value: /^(https?:\/\/).+/,
                    message: 'Logo must be a valid URL starting with http:// or https://',
                  },
                })}
              />
              {errors.logo && (
                <p className="mt-1 text-xs text-red-650">{errors.logo.message}</p>
              )}
            </div>

            {/* Logo Preview */}
            {logoValue && !errors.logo && (
              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-semibold text-surface-700 uppercase tracking-wider">Logo Preview</p>
                <div className="flex items-center gap-5 p-4 rounded-lg border border-surface-200 bg-surface-50">
                  <img
                    src={logoValue}
                    alt="Farm logo preview"
                    className="h-20 w-20 rounded-xl object-contain border border-surface-200 bg-white shadow-sm p-1"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="h-20 w-20 rounded-xl border border-red-200 bg-red-50 hidden items-center justify-center text-red-400"
                    style={{ display: 'none' }}
                  >
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900">Logo loaded successfully</p>
                    <p className="text-xs text-surface-600 mt-0.5">This logo will appear in the sidebar header.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 4: Additional Information ───────────────────── */}
        <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="border-b border-surface-200 pb-3 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-surface-800">Additional Information</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5">

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                Farm Description
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Brief overview of the farm, breeds, and operations..."
                disabled={!isAdmin}
                className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-y disabled:bg-surface-50 disabled:cursor-not-allowed"
                {...register('description')}
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="mb-1.5 block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                Internal Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Staff instructions, operational reminders, license info..."
                disabled={!isAdmin}
                className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-y disabled:bg-surface-50 disabled:cursor-not-allowed"
                {...register('notes')}
              />
            </div>
          </div>
        </div>

        {/* ── Form Actions ─────────────────────────────────────────── */}
        {isAdmin && (
          <div className="flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              disabled={!isDirty || mutation.isPending}
              className="rounded-lg border border-surface-200 hover:bg-surface-100 text-surface-800 px-5 py-2 text-sm font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 text-sm font-semibold shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              Save Settings
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
