'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Briefcase, ChevronRight, DollarSign, GitBranch,
  Users, CheckCircle2, Clock, X, CreditCard, ExternalLink, User
} from 'lucide-react';
import { getUser } from '@/lib/auth';
import { ApplicationStatus, UserRole } from '@boulot/types';
import {
  useGetProjectByIdQuery,
  useGetProjectApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useDepositEscrowMutation,
  useGetEscrowStatusQuery,
} from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ApplicantPortfolioPeek } from '@/components/ApplicantPortfolioPeek';

export default function SmeProjectApplicantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = getUser();

  const isSme = user?.role === UserRole.SME;

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useGetProjectByIdQuery(id as string, { skip: !id || !isSme });

  const [page, setPage] = useState(1);

  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    error: applicationsError,
    refetch: refetchApplications,
  } = useGetProjectApplicationsQuery(
    { projectId: project?._id as string, page, limit: 20 },
    { skip: !isSme || !project?._id }
  );

  const applications = applicationsData?.items || [];

  const [updateStatus, { isLoading: updating }] = useUpdateApplicationStatusMutation();
  const [depositEscrow, { isLoading: depositing }] = useDepositEscrowMutation();

  const {
    data: escrowData,
    refetch: refetchEscrow,
  } = useGetEscrowStatusQuery(project?._id as string, {
    skip: !isSme || !project?._id || !project?.assignedStudentId,
  });

  const [payerPhone, setPayerPhone] = useState(user?.phone || '');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!user) return null;

  if (!isSme) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
          <h1 className="text-2xl font-black mb-2">SME access only</h1>
          <p className="text-gray-500 font-medium">Only SMEs can access this page.</p>
        </div>
      </div>
    );
  }

  if (projectLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading project..." />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorState message="Failed to load project." onRetry={() => refetchProject()} />
      </div>
    );
  }

  const handleSetStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      await updateStatus({ id: applicationId, status }).unwrap();
      if (status === ApplicationStatus.ACCEPTED) {
        alert('Application accepted. You can now deposit escrow to start the project.');
        refetchProject();
      } else {
        alert(`Application ${status.toLowerCase()}.`);
      }
      refetchProject();
      refetchApplications();
    } catch (err: any) {
      const msg = err?.data?.error || err?.error || err?.message || 'Action failed';
      alert(msg);
    }
  };

  const handleDepositEscrow = async () => {
    if (!payerPhone.trim()) {
      alert('Please enter your MoMo phone number.');
      return;
    }
    try {
      await depositEscrow({
        projectId: project._id,
        amount: project.budget,
        payerPhone: payerPhone.trim(),
      }).unwrap();
      setPaymentSuccess(true);
      refetchProject();
      refetchEscrow();
    } catch (err: any) {
      const msg = err?.data?.error || err?.error || err?.message || 'Payment failed';
      alert(msg);
    }
  };

  const assignedStudent = project.assignedStudentId && typeof project.assignedStudentId === 'object'
    ? (project.assignedStudentId as any)
    : null;

  const mentor = project.mentorId && typeof project.mentorId === 'object'
    ? (project.mentorId as any)
    : null;

  const hasEscrow = !!escrowData || project.status === 'IN_PROGRESS' || project.status === 'IN_REVIEW' || project.status === 'COMPLETED';
  const needsPayment = !!project.assignedStudentId && project.status === 'OPEN' && !hasEscrow;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <button
        onClick={() => router.push('/dashboard/projects')}
        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to My Projects
      </button>

      {/* Project Header */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                <Briefcase size={18} />
              </div>
              <StatusBadge status={project.status} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight truncate">{project.title}</h1>
            <p className="text-gray-500 text-sm font-medium mt-2">${project.budget} • {project.status}</p>
          </div>
          <button
            onClick={() => router.push(`/projects/${project._id}`)}
            className="shrink-0 bg-black text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
          >
            Open public view <ChevronRight size={18} />
          </button>
        </div>

        {/* Payment Success Toast */}
        <AnimatePresence>
          {paymentSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3"
            >
              <CheckCircle2 size={20} className="text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-green-800">Payment successful! Escrow deposited.</p>
                <p className="text-xs text-green-700 mt-1">GitHub repository has been created and team members invited.</p>
              </div>
              <button onClick={() => setPaymentSuccess(false)} className="text-green-400 hover:text-green-600">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Description + Applicants */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Description</p>
              <div className="prose prose-sm max-w-none text-gray-700">
                {project.description?.split('\n').map((line: string, i: number) => (
                  <p key={i} className="mb-3">{line}</p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Skills required</p>
              <div className="flex flex-wrap gap-2">
                {project.skillsRequired?.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Applicants Section (only when project is still OPEN and no student assigned) */}
            {project.status === 'OPEN' && !project.assignedStudentId && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Applicants</p>
                <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-5">
                  {applicationsLoading ? (
                    <div className="text-sm text-gray-500 font-medium">Loading applicants…</div>
                  ) : applicationsError ? (
                    <button onClick={() => refetchApplications()} className="text-sm font-bold text-black underline">
                      Failed to load applicants. Retry
                    </button>
                  ) : applications.length === 0 ? (
                    <div className="text-sm text-gray-500 font-medium">No proposals yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {applications.map((a: any) => (
                        <div key={a._id} className="bg-white border border-gray-100 rounded-2xl p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black text-gray-900 truncate">
                                {typeof a.studentId === 'string'
                                  ? 'Applicant'
                                  : `${a.studentId?.firstName || ''} ${a.studentId?.lastName || ''}`.trim() || 'Applicant'}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                                Score: {a.score} • {a.timeline} days • {a.status} {a.label ? `• ${a.label}` : ''}
                              </p>
                              {a.proposalText && (
                                <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 p-3">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Proposal</p>
                                  <p className="text-xs text-gray-700 font-medium leading-relaxed line-clamp-6">{a.proposalText}</p>
                                </div>
                              )}
                              <div className="mt-3 grid grid-cols-3 gap-2">
                                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Completion</p>
                                  <p className="text-xs font-black text-blue-900">{a.studentSummary?.completionRate ?? 0}%</p>
                                </div>
                                <div className="rounded-2xl bg-green-50 border border-green-100 p-3">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-1">Rating</p>
                                  <p className="text-xs font-black text-green-900">{a.studentSummary?.avgRating ?? 0}</p>
                                </div>
                                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Completed</p>
                                  <p className="text-xs font-black text-gray-900">{a.studentSummary?.totalCompleted ?? 0}</p>
                                </div>
                              </div>
                              <ApplicantPortfolioPeek studentId={a.studentId} />
                            </div>

                            <div className="shrink-0 flex flex-col gap-2">
                              {a.status !== ApplicationStatus.ACCEPTED && (
                                <>
                                  <button
                                    type="button"
                                    disabled={updating}
                                    onClick={() => handleSetStatus(a._id, ApplicationStatus.SHORTLISTED)}
                                    className="bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors"
                                  >
                                    Shortlist
                                  </button>
                                  <button
                                    type="button"
                                    disabled={updating}
                                    onClick={() => handleSetStatus(a._id, ApplicationStatus.ACCEPTED)}
                                    className="bg-black disabled:opacity-60 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    disabled={updating}
                                    onClick={() => handleSetStatus(a._id, ApplicationStatus.REJECTED)}
                                    className="bg-red-50 disabled:opacity-60 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          disabled={page <= 1}
                          onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                          className="text-xs font-bold text-black underline disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Page {page}</span>
                        <button
                          type="button"
                          disabled={applications.length < 20}
                          onClick={() => setPage((p: number) => p + 1)}
                          className="text-xs font-bold text-black underline disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Payment, Team, Repo */}
          <div className="space-y-6">
            {/* Escrow Payment Section */}
            {needsPayment && (
              <div className="bg-white border-2 border-green-200 rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="font-black text-sm">Deposit Escrow</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fund the project to start</p>
                  </div>
                </div>

                {assignedStudent && (
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">Selected Candidate</p>
                    <p className="text-sm font-black text-green-900">
                      {assignedStudent.firstName} {assignedStudent.lastName}
                    </p>
                    {assignedStudent.email && (
                      <p className="text-xs text-green-700 mt-0.5">{assignedStudent.email}</p>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-500">Amount</p>
                    <p className="text-2xl font-black">${project.budget}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Held securely in escrow until mentor approval</p>
                </div>

                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    MoMo Phone Number
                  </label>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="+250788000000"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 ring-green-400 outline-none transition-all text-sm font-medium"
                  />
                </div>

                <button
                  onClick={handleDepositEscrow}
                  disabled={depositing}
                  className="w-full bg-green-500 disabled:opacity-60 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
                >
                  {depositing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <DollarSign size={18} /> Pay ${project.budget} via MoMo
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Team Members Section (visible after assignment) */}
            {project.assignedStudentId && (
              <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="font-black text-sm">Project Team</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Members & roles</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Assigned Student */}
                  {assignedStudent && (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-3">
                      <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-xs font-bold">
                        {(assignedStudent.firstName?.[0] || 'S').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{assignedStudent.firstName} {assignedStudent.lastName}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Student (Developer)</p>
                      </div>
                      {assignedStudent.githubUsername && (
                        <span className="text-[10px] font-bold text-gray-400">@{assignedStudent.githubUsername}</span>
                      )}
                    </div>
                  )}

                  {/* SME (You) */}
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                      {(user.firstName?.[0] || 'S').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{user.firstName} {user.lastName} <span className="text-gray-400 font-medium">(You)</span></p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">SME (Project Owner)</p>
                    </div>
                  </div>

                  {/* Mentor */}
                  {mentor && (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                        {(mentor.firstName?.[0] || 'M').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{mentor.firstName} {mentor.lastName}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Mentor (Code Reviewer)</p>
                      </div>
                      {mentor.githubUsername && (
                        <span className="text-[10px] font-bold text-gray-400">@{mentor.githubUsername}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Repository Section (visible after escrow deposit) */}
            {project.repositoryUrl && (
              <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center">
                    <GitBranch size={18} />
                  </div>
                  <div>
                    <p className="font-black text-sm">Repository</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">GitHub project repo</p>
                  </div>
                </div>

                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:border-black transition-colors group"
                >
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-black shrink-0" />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-black truncate">
                    {project.repositoryUrl}
                  </span>
                </a>

                <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <p>Student: push access</p>
                  <p>SME: read-only access</p>
                  <p>Mentor: read-only (code review)</p>
                </div>
              </div>
            )}

            {/* Escrow Status (if payment already made) */}
            {hasEscrow && escrowData && (
              <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <p className="font-black text-sm">Payment Status</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Escrow details</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Amount</span>
                    <span className="font-black">${escrowData.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className={`font-black uppercase text-xs ${
                      escrowData.status === 'ESCROWED' ? 'text-yellow-600' :
                      escrowData.status === 'RELEASED' ? 'text-green-600' :
                      escrowData.status === 'REFUNDED' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {escrowData.status}
                    </span>
                  </div>
                  {escrowData.momoTransactionId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">Transaction ID</span>
                      <span className="font-bold text-gray-700 text-xs">{escrowData.momoTransactionId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Project Timeline Status */}
            {project.assignedStudentId && (
              <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <p className="font-black text-sm">Project Progress</p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Candidate Selected', done: true },
                    { label: 'Escrow Deposited', done: hasEscrow },
                    { label: 'Repository Created', done: !!project.repositoryUrl },
                    { label: 'Team Invited', done: !!project.repositoryUrl },
                    { label: 'In Progress', done: project.status === 'IN_PROGRESS' || project.status === 'IN_REVIEW' || project.status === 'COMPLETED' },
                    { label: 'Submitted for Review', done: project.status === 'IN_REVIEW' || project.status === 'COMPLETED' },
                    { label: 'Completed', done: project.status === 'COMPLETED' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        step.done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'
                      }`}>
                        {step.done ? <CheckCircle2 size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </div>
                      <p className={`text-sm font-medium ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Activity */}
            {project.lastActivity && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Last GitHub Activity</p>
                <p className="text-sm font-bold">{new Date(project.lastActivity).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
