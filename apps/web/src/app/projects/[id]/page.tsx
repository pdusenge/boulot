'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket, joinProject, leaveProject } from '../../../lib/socket';
import { 
  Briefcase, Clock, DollarSign, MapPin, 
  Calendar, CheckCircle2, AlertTriangle, 
  ChevronRight, X, ArrowLeft
} from 'lucide-react';
import { 
  useGetProjectByIdQuery,
  useSubmitReviewMutation,
  useApproveProjectMutation,
  useRejectProjectMutation,
  useDepositEscrowMutation,
  useSubmitApplicationMutation,
  useGetStudentApplicationStatsQuery,
  useGetMyApplicationForProjectQuery
} from '../../../store/api/apiSlice';
import { getUser } from '../../../lib/auth';
import { UserRole } from '@boulot/types';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { IProject } from '@boulot/types';
import { BookOpen } from 'lucide-react';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = getUser();

  const { data: project, isLoading, error, refetch } = useGetProjectByIdQuery(id as string, {
    skip: !id
  });

  const [submitReview] = useSubmitReviewMutation();
  const [approveProject] = useApproveProjectMutation();
  const [rejectProject] = useRejectProjectMutation();
  const [depositEscrow] = useDepositEscrowMutation();
  const [submitApplication, { isLoading: submittingApplication }] = useSubmitApplicationMutation();

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationSubmittedLocally, setApplicationSubmittedLocally] = useState(false);
  const [applicationData, setApplicationData] = useState({
    timeline: 0,
    proposalText: '',
    githubLinks: [''] as string[],
  });

  const isAuthenticated = () => !!user;

  const isStudent = user?.role === UserRole.STUDENT;

  const { data: stats } = useGetStudentApplicationStatsQuery(undefined, { skip: !isStudent });
  const { data: myApplication } = useGetMyApplicationForProjectQuery(
    { projectId: project?._id as string },
    { skip: !isStudent || !project?._id }
  );

  const hasAlreadyApplied = applicationSubmittedLocally || !!myApplication;
  const remainingToday = stats?.remainingToday ?? 0;

  // Render logic flags
  const canApply =
    isStudent &&
    project?.status === 'OPEN' &&
    !project?.assignedStudentId &&
    !hasAlreadyApplied &&
    remainingToday > 0;
  const isAssignedStudent = user?.role === UserRole.STUDENT && project?.assignedStudentId === user?._id;
  const isProjectOwner = user?.role === UserRole.SME && project?.smeId === user?._id;
  const isMentorOrAdmin = user?.role === UserRole.MENTOR || user?.role === UserRole.ADMIN;

  const [lastActivity, setLastActivity] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Real-time socket subscriptions
  useEffect(() => {
    if (!project?._id || !user) return;
    joinProject(project._id);
    const socket = getSocket();
    if (!socket) return;

    const onActivity = (data: any) => {
      setLastActivity(new Date(data.lastActivity).toLocaleString());
    };
    const onPaymentReleased = (data: any) => {
      setNotification('Payment has been released! Check your MoMo account.');
      refetch();
    };
    const onPaymentEscrowed = (data: any) => {
      setNotification('Escrow deposit confirmed. Project is now in progress!');
      refetch();
    };

    socket.on('activity:updated', onActivity);
    socket.on('payment:released', onPaymentReleased);
    socket.on('payment:escrowed', onPaymentEscrowed);

    return () => {
      socket.off('activity:updated', onActivity);
      socket.off('payment:released', onPaymentReleased);
      socket.off('payment:escrowed', onPaymentEscrowed);
      leaveProject(project._id);
    };
  }, [project?._id, user]);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const links = applicationData.githubLinks.filter(l => l.trim() !== '');
      await submitApplication({
        projectId: project!._id,
        timeline: applicationData.timeline,
        proposalText: applicationData.proposalText,
        githubLinks: links,
      }).unwrap();
      alert('Application submitted successfully!');
      setShowApplicationForm(false);
      setApplicationSubmittedLocally(true);
      refetch();
    } catch (err: any) {
      const msg =
        err?.data?.error ||
        err?.error ||
        err?.message ||
        'Failed to submit application';
      alert(msg);
    }
  };

  const executeAction = async (actionFn: () => Promise<any>, successMsg: string) => {
    try {
      await actionFn();
      alert(successMsg);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <LoadingSpinner text="Loading Project Details..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#fafafa] pt-32 px-6 flex items-center justify-center">
         <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
            <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
            <button onClick={() => router.back()} className="text-blue-500 font-bold">Go Back</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      {/* Payment / Activity Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-3"
          >
            <CheckCircle2 size={18} />
            {notification}
            <button onClick={() => setNotification(null)} className="ml-2 opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Block */}
      <section className="bg-white border-b border-gray-100 pt-32 pb-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Explore
          </button>

          <div className="flex flex-col lg:flex-row justify-between gap-10 items-start mt-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <StatusBadge status={project.status} />
                <span className="px-3 py-1.5 bg-gray-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Calendar size={12} /> Posted 2 days ago
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6 leading-[1.1]">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 mt-8">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-bold text-sm tracking-tight text-gray-400 uppercase">Client</p>
                    <p className="font-bold">Verified SME</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-200 hidden md:block" />
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-bold text-sm tracking-tight text-gray-400 uppercase">Mentor</p>
                    <p className="font-bold">
                      {project.mentorId && typeof project.mentorId === 'object'
                        ? `${(project.mentorId as any).firstName || ''} ${(project.mentorId as any).lastName || ''}`.trim()
                        : 'Pending assignment'}
                    </p>
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-200 hidden md:block" />
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  <MapPin size={18} /> Remote (Global)
                </div>
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  <Briefcase size={18} /> Contract
                </div>
                {(project.status === 'IN_PROGRESS' || project.status === 'IN_REVIEW') && (
                  <>
                    <div className="h-8 w-px bg-gray-200 hidden md:block" />
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                      <Clock size={18} />
                      <span className="text-xs">
                        Last Activity: {lastActivity || (project.lastActivity ? new Date(project.lastActivity).toLocaleString() : 'No activity yet')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-8 rounded-[32px] min-w-[300px] flex flex-col items-center justify-center text-center shadow-inner">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Project Budget</p>
              <h2 className="text-5xl font-black tracking-tighter text-black mb-4 flex items-center">
                <DollarSign size={40} className="text-gray-300 -mr-2" />{project.budget}
              </h2>
              <p className="text-sm text-gray-500 font-medium">Fixed-price contract</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-12 shadow-sm">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <BookOpen size={24} className="text-gray-400" />
                Project Description
              </h3>
              <div className="prose prose-lg text-gray-600 leading-relaxed custom-formatting">
                {project.description.split('\n').map((line: string, i: number) => (
                  <p key={i} className="mb-4">{line}</p>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-12 shadow-sm">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <CheckCircle2 size={24} className="text-gray-400" />
                Skills & Requirements
              </h3>
              <div className="flex flex-wrap gap-3">
                {project.skillsRequired.map((skill: string) => (
                  <span key={skill} className="px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 capitalize shadow-sm hover:border-black transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm top-8">
              <h3 className="text-xl font-bold mb-6">Take Action</h3>
              <div className="space-y-4">
                
                {/* Proposal Submission Toggle */}
                {!showApplicationForm ? (
                  <>
                    {canApply && (
                      <button 
                        onClick={() => setShowApplicationForm(true)}
                        className="w-full bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all hover:shadow-xl group shadow-sm"
                      >
                        Apply to this project
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}

                    {isStudent && project?.status === 'OPEN' && !project?.assignedStudentId && hasAlreadyApplied && (
                      <button
                        type="button"
                        disabled
                        className="w-full bg-gray-100 text-gray-500 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 cursor-not-allowed"
                      >
                        Application already submitted
                      </button>
                    )}

                    {isStudent && project?.status === 'OPEN' && !project?.assignedStudentId && !hasAlreadyApplied && remainingToday <= 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
                        <p className="text-sm font-bold text-yellow-700 mb-1">Daily limit reached</p>
                        <p className="text-xs text-yellow-700/80 font-medium">You’ve used all applications for today. Try again tomorrow.</p>
                      </div>
                    )}
                    
                    {!isAuthenticated() && (
                      <button 
                        onClick={() => router.push('/login')}
                        className="w-full bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all hover:shadow-xl group"
                      >
                        Sign In to Apply
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}

                    {/* Student Form Workflow */}
                    {isAssignedStudent && project.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => executeAction(() => submitReview(project._id).unwrap(), 'Submitted for Mentor Review!')}
                        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all"
                      >
                        Submit Code for Review
                      </button>
                    )}

                    {/* SME Form Workflow */}
                    {isProjectOwner && project.status === 'OPEN' && project.assignedStudentId && (
                      user?.phone ? (
                        <button
                          onClick={() => executeAction(() => depositEscrow({
                            projectId: project._id, amount: project.budget, payerPhone: user.phone!
                          }).unwrap(), 'Funds Escrowed! Project Started.')}
                          className="w-full bg-green-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
                        >
                          <DollarSign size={20} /> Deposit Escrow (${project.budget})
                        </button>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
                          <p className="text-sm font-bold text-yellow-700 mb-2">Phone number required for MoMo payment</p>
                          <button
                            onClick={() => router.push('/dashboard/profile')}
                            className="text-xs font-bold text-black underline"
                          >
                            Update your profile with your phone number
                          </button>
                        </div>
                      )
                    )}

                    {/* SME applicant review moved to SME portal (/dashboard/projects/[id]) */}

                    {/* Mentor Review Workflow */}
                    {isMentorOrAdmin && project.status === 'IN_REVIEW' && (
                      <div className="flex gap-4">
                        <button 
                          onClick={() => executeAction(() => approveProject({ projectId: project._id, feedback: 'Great job!' }).unwrap(), 'Project Approved! Escrow Released.')}
                          className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition-all text-sm"
                        >
                          Approve Code
                        </button>
                        <button 
                          onClick={() => executeAction(() => rejectProject({ projectId: project._id, feedback: 'Needs work.' }).unwrap(), 'Project Rejected.')}
                          className="flex-1 bg-red-50 text-red-600 border border-red-200 py-4 rounded-2xl font-bold hover:bg-red-100 transition-all text-sm"
                        >
                          Reject Code
                        </button>
                      </div>
                    )}

                    {/* Dispute Workflow */}
                    {(isProjectOwner || isAssignedStudent) && 
                     (project.status === 'IN_PROGRESS' || project.status === 'IN_REVIEW') && (
                      <button 
                        onClick={() => router.push('/dashboard/disputes')}
                        className="w-full mt-4 bg-orange-50 text-orange-600 border border-orange-200 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-orange-100 transition-colors"
                      >
                        Raise Dispute
                      </button>
                    )}

                    {/* General Closed State */}
                    {(!canApply && !isAssignedStudent && !isProjectOwner && !isMentorOrAdmin && project.status !== 'OPEN') || project.status === 'COMPLETED' ? (
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-500 text-xs text-center font-bold tracking-widest uppercase">
                        {project.status === 'COMPLETED' ? 'Project Completed' : 'Applications Closed'}
                      </div>
                    ) : null}

                  </>
                ) : null}

                {/* Proposal Submission Form Component */}
                <AnimatePresence>
                  {showApplicationForm && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleApplicationSubmit}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-sm">Apply</h4>
                          <button type="button" onClick={() => setShowApplicationForm(false)} className="text-gray-400 hover:text-black">
                            <X size={16} />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Timeline (Days)</label>
                          <input 
                            type="number" 
                            required
                            min={1}
                            value={applicationData.timeline || ''}
                            onChange={e => setApplicationData({...applicationData, timeline: Number(e.target.value)})}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 ring-black outline-none transition-all text-sm font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Proposal</label>
                          <textarea
                            required
                            rows={4}
                            value={applicationData.proposalText}
                            onChange={e => setApplicationData({...applicationData, proposalText: e.target.value})}
                            placeholder="Describe your approach, relevant experience, and deliverables. Include brief milestones."
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 ring-black outline-none transition-all text-sm resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">GitHub Links (up to 5)</label>
                          {applicationData.githubLinks.map((link, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                              <input
                                type="url"
                                value={link}
                                onChange={e => {
                                  const updated = [...applicationData.githubLinks];
                                  updated[idx] = e.target.value;
                                  setApplicationData({...applicationData, githubLinks: updated});
                                }}
                                placeholder="https://github.com/your-project"
                                className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 ring-black outline-none transition-all text-sm"
                              />
                              {applicationData.githubLinks.length > 1 && (
                                <button type="button" onClick={() => {
                                  const updated = applicationData.githubLinks.filter((_, i) => i !== idx);
                                  setApplicationData({...applicationData, githubLinks: updated});
                                }} className="text-gray-400 hover:text-red-500 px-2">
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          {applicationData.githubLinks.length < 5 && (
                            <button type="button" onClick={() => setApplicationData({
                              ...applicationData, githubLinks: [...applicationData.githubLinks, '']
                            })} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black">
                              + Add another link
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Remaining today: {stats?.remainingToday ?? '—'} / {stats?.dailyLimit ?? '—'}
                          </p>
                          {project?.applicationDeadline && (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              Deadline: {new Date(project.applicationDeadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <button type="submit" disabled={submittingApplication} className="w-full bg-black disabled:opacity-60 text-white p-4 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
                          {submittingApplication ? 'Submitting…' : 'Submit Application'}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Disclaimer Box */}
            <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-[32px]">
              <div className="flex gap-3 text-orange-600">
                <AlertTriangle size={20} className="shrink-0" />
                <div>
                  <h4 className="font-bold text-sm mb-1">Safe Transactions</h4>
                  <p className="text-xs opacity-80 leading-relaxed font-medium">All payments are held securely in Escrow until the code is verified by Mentors.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
