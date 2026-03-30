'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserRole, ProposalStatus } from '@boulot/types';
import { useGetMyProposalsQuery } from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StudentProposalsPage() {
  const user = getUser();
  const isStudent = user?.role === UserRole.STUDENT;
  const { data: proposals = [], isLoading, error, refetch } = useGetMyProposalsQuery(undefined, { skip: !isStudent });

  if (!user) return null;

  if (!isStudent) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
          <h1 className="text-2xl font-black mb-2">Student access only</h1>
          <p className="text-gray-500 font-medium">Only students can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
          <Layers size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black">My Proposals</h1>
          <p className="text-gray-500 text-sm font-medium">Track your applications and their status.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
        {isLoading ? (
          <LoadingSpinner text="Loading proposals..." />
        ) : error ? (
          <ErrorState message="Failed to load proposals." onRetry={() => refetch()} />
        ) : proposals.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No proposals yet"
            description="Browse projects and submit proposals to get started."
          />
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => (
              <div key={p._id} className="border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Project</p>
                  {(() => {
                    const proj: any = (p as any).projectId;
                    const projectId = typeof proj === 'string' ? proj : proj?._id;
                    const projectTitle = typeof proj === 'object' && proj?.title ? proj.title : projectId;
                    return <p className="font-black text-lg">{projectTitle}</p>;
                  })()}
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    ${p.proposedPrice} • {p.estimatedDays} days
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      p.status === ProposalStatus.ACCEPTED
                        ? 'bg-green-50 text-green-600 border border-green-100'
                        : p.status === ProposalStatus.REJECTED
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-gray-50 text-gray-600 border border-gray-100'
                    }`}
                  >
                    {p.status}
                  </span>
                  <Link
                    href={`/projects/${typeof (p as any).projectId === 'string' ? (p as any).projectId : (p as any).projectId?._id}`}
                    className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-colors"
                  >
                    Open <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

