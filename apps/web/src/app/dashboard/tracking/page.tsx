'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Eye, ArrowRight, Users, GitBranch, Clock,
  ExternalLink, CheckCircle2, AlertTriangle, Search
} from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserRole } from '@boulot/types';
import { useGetMentorProjectsQuery } from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';

const statusOrder: Record<string, number> = {
  IN_REVIEW: 0,
  IN_PROGRESS: 1,
  OPEN: 2,
  COMPLETED: 3,
  CANCELLED: 4,
};

export default function MentorTrackingPage() {
  const user = getUser();
  const isAllowed = user?.role === UserRole.MENTOR || user?.role === UserRole.ADMIN;
  const { data: projects = [], isLoading, error, refetch } = useGetMentorProjectsQuery(undefined, { skip: !isAllowed });

  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;
  if (!isAllowed) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
          <h1 className="text-2xl font-black mb-2">Mentor access only</h1>
          <p className="text-gray-500 font-medium">Only mentors can access the project tracking page.</p>
        </div>
      </div>
    );
  }

  const filteredProjects = projects
    .filter((p: any) => filter === 'ALL' || p.status === filter)
    .filter((p: any) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const studentName = p.assignedStudentId && typeof p.assignedStudentId === 'object'
        ? `${p.assignedStudentId.firstName || ''} ${p.assignedStudentId.lastName || ''}`.toLowerCase()
        : '';
      const smeName = p.smeId && typeof p.smeId === 'object'
        ? `${p.smeId.firstName || ''} ${p.smeId.lastName || ''}`.toLowerCase()
        : '';
      return p.title.toLowerCase().includes(q) || studentName.includes(q) || smeName.includes(q);
    })
    .sort((a: any, b: any) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));

  const statusCounts = projects.reduce((acc: Record<string, number>, p: any) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
          <Eye size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black">Project Tracking</h1>
          <p className="text-gray-500 text-sm font-medium">Monitor all your assigned projects and team members.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', count: projects.length, color: 'bg-gray-900 text-white', filterKey: 'ALL' },
          { label: 'In Progress', count: statusCounts['IN_PROGRESS'] || 0, color: 'bg-blue-50 text-blue-700 border border-blue-100', filterKey: 'IN_PROGRESS' },
          { label: 'In Review', count: statusCounts['IN_REVIEW'] || 0, color: 'bg-yellow-50 text-yellow-700 border border-yellow-100', filterKey: 'IN_REVIEW' },
          { label: 'Open', count: statusCounts['OPEN'] || 0, color: 'bg-green-50 text-green-700 border border-green-100', filterKey: 'OPEN' },
          { label: 'Completed', count: statusCounts['COMPLETED'] || 0, color: 'bg-purple-50 text-purple-700 border border-purple-100', filterKey: 'COMPLETED' },
        ].map((stat) => (
          <button
            key={stat.filterKey}
            onClick={() => setFilter(stat.filterKey)}
            className={`rounded-2xl p-4 text-center transition-all ${stat.color} ${
              filter === stat.filterKey ? 'ring-2 ring-black ring-offset-2' : ''
            }`}
          >
            <p className="text-2xl font-black">{stat.count}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project title, student, or SME name..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 ring-black outline-none transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
        {isLoading ? (
          <LoadingSpinner text="Loading your projects..." />
        ) : error ? (
          <ErrorState message="Failed to load projects." onRetry={() => refetch()} />
        ) : filteredProjects.length === 0 ? (
          <EmptyState icon={Eye} title="No projects found" description={filter === 'ALL' ? 'You have no assigned projects yet.' : `No ${filter.replace('_', ' ').toLowerCase()} projects.`} />
        ) : (
          <div className="space-y-6">
            {filteredProjects.map((p: any) => {
              const student = p.assignedStudentId && typeof p.assignedStudentId === 'object' ? p.assignedStudentId : null;
              const sme = p.smeId && typeof p.smeId === 'object' ? p.smeId : null;

              return (
                <div
                  key={p._id}
                  className="border border-gray-100 rounded-3xl p-6 hover:border-gray-200 transition-colors"
                >
                  {/* Project Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={p.status} />
                        <span className="text-gray-400 text-xs font-medium">${p.budget}</span>
                      </div>
                      <p className="font-black text-lg">{p.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.repositoryUrl && (
                        <a
                          href={p.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 transition-colors"
                        >
                          <GitBranch size={14} /> Repo
                        </a>
                      )}
                      <Link
                        href={`/projects/${p._id}`}
                        className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-colors"
                      >
                        View <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={14} className="text-gray-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Team Members</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Student */}
                      <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                          {student ? (student.firstName?.[0] || 'S').toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0">
                          {student ? (
                            <>
                              <p className="text-sm font-bold truncate">{student.firstName} {student.lastName}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Student</p>
                              {student.githubUsername && (
                                <p className="text-[10px] text-gray-400 truncate">@{student.githubUsername}</p>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-gray-400">Not assigned</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Student</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* SME */}
                      <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                          {sme ? (sme.firstName?.[0] || 'C').toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0">
                          {sme ? (
                            <>
                              <p className="text-sm font-bold truncate">{sme.firstName} {sme.lastName}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">SME (Client)</p>
                              {sme.email && (
                                <p className="text-[10px] text-gray-400 truncate">{sme.email}</p>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-gray-400">Unknown</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">SME</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Mentor (You) */}
                      <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-purple-100">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                          {(user.firstName?.[0] || 'M').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{user.firstName} {user.lastName} <span className="text-gray-400 font-medium">(You)</span></p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Mentor</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer info */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {p.lastActivity && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        Last activity: {new Date(p.lastActivity).toLocaleDateString()}
                      </span>
                    )}
                    {p.repositoryUrl && (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-green-500" />
                        Repo provisioned
                      </span>
                    )}
                    {p.status === 'IN_REVIEW' && (
                      <span className="flex items-center gap-1.5 text-yellow-600">
                        <AlertTriangle size={12} />
                        Awaiting your review
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
