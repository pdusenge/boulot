'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Briefcase, Plus } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserRole } from '@boulot/types';
import { useGetMyProjectsQuery } from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProjectCard } from '@/components/ui/ProjectCard';

export default function SmeProjectsPage() {
  const user = getUser();
  const isSme = user?.role === UserRole.SME;
  const { data: projects = [], isLoading, error, refetch } = useGetMyProjectsQuery(undefined, { skip: !isSme });

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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
            <Briefcase size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-black">My Projects</h1>
            <p className="text-gray-500 text-sm font-medium">Manage your projects and hiring pipeline.</p>
          </div>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={18} />
          Post New Project
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading your projects..." />
      ) : error ? (
        <ErrorState message="Failed to load projects." onRetry={() => refetch()} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description="Post your first project to start receiving student proposals."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => (
            <ProjectCard key={p._id} project={p} detailsHref={`/dashboard/projects/${p._id}`} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

