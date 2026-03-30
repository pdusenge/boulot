'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserRole } from '@boulot/types';
import { useGetReviewQueueQuery } from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function ReviewQueuePage() {
  const user = getUser();
  const isAllowed = user?.role === UserRole.MENTOR || user?.role === UserRole.ADMIN;
  const { data: projects = [], isLoading, error, refetch } = useGetReviewQueueQuery(undefined, { skip: !isAllowed });

  if (!user) return null;
  if (!isAllowed) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
          <h1 className="text-2xl font-black mb-2">Mentor/Admin access only</h1>
          <p className="text-gray-500 font-medium">Only mentors and admins can access the review queue.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
          <CheckSquare size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black">Review Queue</h1>
          <p className="text-gray-500 text-sm font-medium">Projects awaiting mentor approval.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
        {isLoading ? (
          <LoadingSpinner text="Loading review queue..." />
        ) : error ? (
          <ErrorState message="Failed to load review queue." onRetry={() => refetch()} />
        ) : projects.length === 0 ? (
          <EmptyState icon={CheckSquare} title="Nothing to review" description="No projects are currently awaiting review." />
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <div
                key={p._id}
                className="border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <div className="mb-2">
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="font-black text-lg">{p.title}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">${p.budget} • SME: {p.smeId}</p>
                </div>
                <Link
                  href={`/projects/${p._id}`}
                  className="bg-black text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  Review <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

