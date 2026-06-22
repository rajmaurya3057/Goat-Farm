import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { goatsApi } from '../api/goats.api';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/helpers';
import { ROUTES } from '../utils/constants';

function calculateAge(dobString) {
  if (!dobString) return '—';
  const dob = new Date(dobString);
  const now = new Date();
  const diffTime = now - dob;
  if (diffTime < 0) return 'Future Date';

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 30) return `${diffDays} days`;

  const diffMonths = Math.floor(diffDays / 30.436875);
  if (diffMonths < 12) return `${diffMonths} months`;

  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  return months > 0 ? `${years} yr ${months} mo` : `${years} years`;
}

export default function ViewGoatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isSubmittingWeight, setIsSubmittingWeight] = useState(false);

  // Fetch goat details
  const goatQuery = useQuery({
    queryKey: ['goat', id],
    queryFn: async () => {
      const res = await goatsApi.getGoatById(id);
      return res.data.data;
    },
    enabled: Boolean(id),
  });

  // Record weight mutation
  const weightMutation = useMutation({
    mutationFn: async (weight) => {
      await goatsApi.recordWeight(id, weight);
    },
    onSuccess: () => {
      toast.success('Weight recorded successfully');
      setIsWeightModalOpen(false);
      resetWeightForm();
      queryClient.invalidateQueries({ queryKey: ['goat', id] });
      queryClient.invalidateQueries({ queryKey: ['goats'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to record weight'));
    },
    onSettled: () => {
      setIsSubmittingWeight(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await goatsApi.deleteGoat(id);
    },
    onSuccess: () => {
      toast.success('Goat deleted successfully');
      navigate(ROUTES.GOATS);
      queryClient.invalidateQueries({ queryKey: ['goats'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete goat'));
    },
  });

  // Form for weight recording
  const {
    register: registerWeight,
    handleSubmit: handleWeightSubmit,
    reset: resetWeightForm,
    formState: { errors: weightErrors },
  } = useForm({
    defaultValues: {
      weight: '',
    },
  });

  const onWeightSubmit = (values) => {
    setIsSubmittingWeight(true);
    weightMutation.mutate(parseFloat(values.weight));
  };

  const handleDelete = () => {
    const name = goatData?.goat?.name || 'this goat';
    const tag = goatData?.goat?.uidTag || '';
    const confirmed = window.confirm(`Are you sure you want to delete goat ${name} (${tag})? This action cannot be undone.`);
    if (confirmed) {
      deleteMutation.mutate();
    }
  };

  if (goatQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse flex items-center justify-between p-4 bg-white rounded-xl border border-surface-200 shadow-sm">
          <div className="h-6 bg-surface-200 rounded w-1/4" />
          <div className="h-10 bg-surface-200 rounded w-20" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-pulse h-60 bg-white rounded-xl border border-surface-200 p-6" />
            <div className="animate-pulse h-48 bg-white rounded-xl border border-surface-200 p-6" />
          </div>
          <div className="animate-pulse h-96 bg-white rounded-xl border border-surface-200 p-6" />
        </div>
      </div>
    );
  }

  if (goatQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-600 border border-red-100 shadow-sm">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-surface-900">Goat Profile Unavailable</h3>
        <p className="mt-2 text-sm text-surface-700 max-w-md">{getErrorMessage(goatQuery.error)}</p>
        <div className="mt-6 flex gap-4">
          <Link
            to={ROUTES.GOATS}
            className="rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-800 px-4 py-2 text-sm font-semibold transition"
          >
            Back to List
          </Link>
          <button
            onClick={() => goatQuery.refetch()}
            className="rounded-lg bg-red-650 hover:bg-red-700 text-white px-5 py-2 text-sm font-semibold transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const goatData = goatQuery.data;
  const goat = goatData.goat;
  const mother = goatData.mother;
  const father = goatData.father;
  const kids = goatData.kids ?? [];
  const weightHistory = goatData.weightHistory ?? [];
  const vaccinations = goatData.vaccinations ?? [];
  const treatments = goatData.treatments ?? [];

  const isAdmin = user?.role === 'ADMIN';
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const statusColors = {
    Active: 'bg-emerald-55 text-emerald-700 border-emerald-200',
    Pregnant: 'bg-purple-55 text-purple-700 border-purple-200',
    Sold: 'bg-blue-55 text-blue-700 border-blue-200',
    Dead: 'bg-red-55 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
            <Link to={ROUTES.GOATS} className="hover:text-primary-650 transition">Goats</Link>
            <span>/</span>
            <span>Profile</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-900">{goat.name}</h1>
            <span className="rounded-lg bg-surface-100 border border-surface-200 px-2.5 py-0.5 text-xs font-bold text-surface-800 uppercase">
              {goat.uidTag}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {isStaffOrAdmin && (
            <Link
              to={`/goats/${goat._id}/edit`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary-200 bg-white hover:bg-primary-50 text-primary-750 px-4 py-2 text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
          )}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50/50 text-red-700 px-4 py-2 text-sm font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Goat
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* General info card */}
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-surface-50 border-b border-surface-200 px-6 py-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">General Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Gender</dt>
                <dd className="mt-1 text-sm font-medium text-surface-900 flex items-center gap-1">
                  {goat.gender === 'Male' ? (
                    <>
                      <svg className="h-4 w-4 text-blue-550" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0-5.656h5.656v5.656m-9.9 2.122a6.364 6.364 0 109 9 6.364 6.364 0 00-9-9z" />
                      </svg>
                      Male
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 text-pink-550" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11a5 5 0 100-10 5 5 0 000 10zm0 0v12m-4-4h8" />
                      </svg>
                      Female
                    </>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Breed</dt>
                <dd className="mt-1 text-sm font-medium text-surface-900">{goat.breed || '—'}</dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Color</dt>
                <dd className="mt-1 text-sm font-medium text-surface-900">{goat.color || '—'}</dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Date of Birth</dt>
                <dd className="mt-1 text-sm font-medium text-surface-900">
                  {goat.dob ? new Date(goat.dob).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Calculated Age</dt>
                <dd className="mt-1 text-sm font-medium text-surface-900">{calculateAge(goat.dob)}</dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-surface-500 uppercase">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[goat.status] || 'bg-surface-50 text-surface-700 border-surface-200'}`}>
                    {goat.status}
                  </span>
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-surface-500 uppercase">Notes</dt>
                <dd className="mt-1.5 text-sm text-surface-750 bg-surface-50 rounded-lg p-3 border border-surface-150 whitespace-pre-line leading-relaxed">
                  {goat.notes || 'No notes available for this goat.'}
                </dd>
              </div>
            </div>
          </div>

          {/* Lineage & Offspring Card */}
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-surface-50 border-b border-surface-200 px-6 py-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Lineage & Offspring</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Parents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-lg border border-surface-200 p-4 hover:shadow-sm transition-all duration-200 bg-white">
                  <span className="text-xs font-semibold text-surface-500 uppercase">Mother</span>
                  <div className="mt-2">
                    {mother ? (
                      <Link to={`/goats/${mother._id}`} className="group flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-surface-900 group-hover:text-primary-650 transition">{mother.name}</p>
                          <p className="text-xs text-surface-650 mt-0.5">{mother.uidTag}</p>
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColors[mother.status] || 'bg-surface-50 text-surface-750'}`}>
                          {mother.status}
                        </span>
                      </Link>
                    ) : (
                      <p className="text-sm text-surface-600 font-medium italic">No mother registered</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-surface-200 p-4 hover:shadow-sm transition-all duration-200 bg-white">
                  <span className="text-xs font-semibold text-surface-500 uppercase">Father</span>
                  <div className="mt-2">
                    {father ? (
                      <Link to={`/goats/${father._id}`} className="group flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-surface-900 group-hover:text-primary-650 transition">{father.name}</p>
                          <p className="text-xs text-surface-650 mt-0.5">{father.uidTag}</p>
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColors[father.status] || 'bg-surface-50 text-surface-750'}`}>
                          {father.status}
                        </span>
                      </Link>
                    ) : (
                      <p className="text-sm text-surface-600 font-medium italic">No father registered</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Kids Offspring */}
              <div>
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider block mb-3">Offspring Kids ({kids.length})</span>
                {kids.length === 0 ? (
                  <p className="text-sm text-surface-600 italic bg-surface-50 border border-surface-150 p-4 rounded-lg">No offspring recorded for this goat.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {kids.map((kid) => (
                      <Link
                        key={kid._id}
                        to={`/goats/${kid._id}`}
                        className="group flex items-center justify-between rounded-lg border border-surface-150 p-3 hover:border-primary-300 hover:shadow-sm transition-all duration-200 bg-white"
                      >
                        <div>
                          <p className="text-sm font-bold text-surface-900 group-hover:text-primary-650 transition">{kid.name}</p>
                          <p className="text-xs text-surface-650 mt-0.5">{kid.uidTag} • {kid.gender}</p>
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColors[kid.status] || 'bg-surface-50'}`}>
                          {kid.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Health Records (Vaccination & Treatment) */}
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-surface-50 border-b border-surface-200 px-6 py-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Medical History</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Vaccinations */}
              <div>
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider block mb-3">Vaccinations ({vaccinations.length})</span>
                {vaccinations.length === 0 ? (
                  <p className="text-sm text-surface-600 italic bg-surface-50 border border-surface-150 p-4 rounded-lg">No vaccinations registered.</p>
                ) : (
                  <div className="overflow-x-auto border border-surface-150 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-surface-50 border-b border-surface-150">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold text-surface-800">Vaccine Name</th>
                          <th className="px-4 py-2.5 font-semibold text-surface-800">Date Given</th>
                          <th className="px-4 py-2.5 font-semibold text-surface-800">Next Due Date</th>
                          <th className="px-4 py-2.5 font-semibold text-surface-800">Veterinarian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-100">
                        {vaccinations.map((vac) => (
                          <tr key={vac._id} className="hover:bg-surface-50/50">
                            <td className="px-4 py-2.5 font-bold text-surface-900">{vac.vaccineName}</td>
                            <td className="px-4 py-2.5 text-surface-700">{new Date(vac.dateGiven).toLocaleDateString()}</td>
                            <td className="px-4 py-2.5 text-surface-700 font-medium">
                              {vac.nextDueDate ? (
                                <span className={new Date(vac.nextDueDate) < new Date() ? 'text-red-650 font-bold' : ''}>
                                  {new Date(vac.nextDueDate).toLocaleDateString()}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-surface-700">{vac.veterinarian || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Treatments */}
              <div>
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider block mb-3">Treatments ({treatments.length})</span>
                {treatments.length === 0 ? (
                  <p className="text-sm text-surface-600 italic bg-surface-50 border border-surface-150 p-4 rounded-lg">No treatment records registered.</p>
                ) : (
                  <div className="overflow-x-auto border border-surface-150 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-surface-50 border-b border-surface-150">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold text-surface-800">Disease</th>
                          <th className="px-4 py-2.5 font-semibold text-surface-800">Medicine Administered</th>
                          <th className="px-4 py-2.5 font-semibold text-surface-800">Treatment Date</th>
                          <th className="px-4 py-2.5 font-semibold text-surface-800">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-100">
                        {treatments.map((tr) => (
                          <tr key={tr._id} className="hover:bg-surface-50/50">
                            <td className="px-4 py-2.5 font-bold text-surface-900">{tr.disease}</td>
                            <td className="px-4 py-2.5 text-surface-700 font-semibold">{tr.medicine?.name || '—'} ({tr.medicine?.type || '—'})</td>
                            <td className="px-4 py-2.5 text-surface-700">{new Date(tr.treatmentDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2.5 text-surface-700 truncate max-w-xs">{tr.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Weight History & Logs */}
        <div className="space-y-6">
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-surface-50 border-b border-surface-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-800">Weight History</h3>
              {isStaffOrAdmin && (
                <button
                  onClick={() => setIsWeightModalOpen(true)}
                  className="inline-flex items-center gap-1 hover:bg-surface-200 text-primary-750 px-2 py-1 text-xs font-bold transition rounded cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Record
                </button>
              )}
            </div>

            <div className="p-6">
              {weightHistory.length === 0 ? (
                <p className="text-sm text-surface-650 italic text-center py-6">No weight history records yet.</p>
              ) : (
                <div className="relative border-l border-surface-250 ml-1.5 space-y-5">
                  {weightHistory
                    .slice()
                    .reverse()
                    .map((log) => (
                      <div key={log._id} className="relative pl-6">
                        {/* Dot indicator */}
                        <div className="absolute -left-1.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-primary-600 bg-white" />
                        <div>
                          <p className="text-sm font-bold text-surface-900">{log.weight} kg</p>
                          <p className="text-xs text-surface-600 mt-0.5">
                            {new Date(log.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Weight Modal */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-surface-200 p-6 shadow-xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-surface-100 pb-3">
              <h3 className="text-base font-bold text-surface-900">Record New Weight</h3>
              <button
                type="button"
                onClick={() => {
                  setIsWeightModalOpen(false);
                  resetWeightForm();
                }}
                className="text-surface-600 hover:text-surface-850"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleWeightSubmit(onWeightSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-900">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 24.5"
                  className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-surface-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 ${
                    weightErrors.weight ? 'border-red-300 focus:border-red-500' : 'border-surface-250 focus:border-primary-500'
                  }`}
                  {...registerWeight('weight', {
                    required: 'Weight is required',
                    min: { value: 0.1, message: 'Weight must be at least 0.1 kg' },
                    max: { value: 300, message: 'Weight must be less than 300 kg' },
                  })}
                />
                {weightErrors.weight && (
                  <p className="mt-1 text-xs text-red-650">{weightErrors.weight.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsWeightModalOpen(false);
                    resetWeightForm();
                  }}
                  className="rounded-lg border border-surface-250 px-4 py-2 text-xs font-bold text-surface-750 hover:bg-surface-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWeight}
                  className="flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 px-4.5 py-2 text-xs font-bold text-white shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingWeight && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
