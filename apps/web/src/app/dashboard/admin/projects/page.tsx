'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Briefcase, ArrowRight, Users, GitBranch, Clock,
  CheckCircle2, AlertTriangle, Search, DollarSign, Eye
} from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserRole } from '@boulot/types';
import { useGetAdminAllProjectsQuery } from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';

const statusOrder: Record<string, number> = {
  IN_REVIEW: 0,
  IN_PROGRESS: 1,
  OPEN: 2,
  DRAFT: 3,
  COMPLETED: 4,
  CANCELLED: 5,
};

export default function AdminProjectsPage() {
  const user = getUser();
  const isAdmin = user?.role === UserRole.ADMIN;
  const { data: projects = [], isLoading, error, refetch } = useGetAdminAllProjectsQuery(undefined, { skip: !isAdmin });

  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
          <h1 className="text-2xl font-black mb-2">Admin access only</h1>
          <p className="text-gray-500 font-medium">You don't have access to this area.</p>
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
      const mentorName = p.mentorId && typeof p.mentorId === 'object'
        ? `${p.mentorId.firstName || ''} ${p.mentorId.lastName || ''}`.toLowerCase()
        : '';
      return p.title.toLowerCase().includes(q) || studentName.includes(q) || smeName.includes(q) || mentorName.includes(q);
    })
    .sort((a: any, b: any) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));

  const statusCounts = projects.reduce((acc: Record<string, number>, p: any) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
          <Briefcase size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black">All Projects</h1>
          <p className="text-gray-500 text-sm font-medium">Overview of every project on the platform.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {[
          { label: 'Total', count: projects.length, color: 'bg-gray-900 text-white', filterKey: 'ALL' },
          { label: 'Open', count: statusCounts['OPEN'] || 0, color: 'bg-green-50 text-green-700 border border-green-100', filterKey: 'OPEN' },
          { label: 'In Progress', count: statusCounts['IN_PROGRESS'] || 0, color: 'bg-blue-50 text-blue-700 border border-blue-100', filterKey: 'IN_PROGRESS' },
          { label: 'In Review', count: statusCounts['IN_REVIEW'] || 0, color: 'bg-yellow-50 text-yellow-700 border border-yellow-100', filterKey: 'IN_REVIEW' },
          { label: 'Completed', count: statusCounts['COMPLETED'] || 0, color: 'bg-purple-50 text-purple-700 border border-purple-100', filterKey: 'COMPLETED' },
          { label: 'Cancelled', count: statusCounts['CANCELLED'] || 0, color: 'bg-red-50 text-red-700 border border-red-100', filterKey: 'CANCELLED' },
          { label: `$${totalBudget.toLocaleString()}`, count: null, color: 'bg-emerald-50 text-emerald-700 border border-emerald-100', filterKey: null },
        ].map((stat, i) => (
          stat.filterKey ? (
            <button
              key={i}
              onClick={() => setFilter(stat.filterKey!)}
              className={`rounded-2xl p-4 text-center transition-all ${stat.color} ${
                filter === stat.filterKey ? 'ring-2 ring-black ring-offset-2' : ''
              }`}
            >
              <p className="text-2xl font-black">{stat.count}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </button>
          ) : (
            <div key={i} className={`rounded-2xl p-4 text-center ${stat.color}`}>
              <p className="text-lg font-black">{stat.label}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Total Budget</p>
            </div>
          )
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
            placeholder="Search by project title, student, SME, or mentor name..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 ring-black outline-none transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
        {isLoading ? (
          <LoadingSpinner text="Loading all projects..." />
        ) : error ? (
          <ErrorState message="Failed to load projects." onRetry={() => refetch()} />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No projects found"
            description={filter === 'ALL' ? 'No projects exist yet.' : `No ${filter.replace('_', ' ').toLowerCase()} projects.`}
          />
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((p: any) => {
              const student = p.assignedStudentId && typeof p.assignedStudentId === 'object' ? p.assignedStudentId : null;
              const sme = p.smeId && typeof p.smeId === 'object' ? p.smeId : null;
              const mentor = p.mentorId && typeof p.mentorId === 'object' ? p.mentorId : null;

              return (
                <div
                  key={p._id}
                  className="border border-gray-100 rounded-3xl p-5 hover:border-gray-200 transition-colors"
                >
                  {/* Header row */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusBadge status={p.status} />
                      <p className="font-black text-base truncate">{p.title}</p>
                      <span className="text-xs text-gray-400 font-bold shrink-0">${p.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {p.repositoryUrl && (
                        <a
                          href={p.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 text-gray-700 px-3 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-gray-200 transition-colors"
                        >
                          <GitBranch size={12} /> Repo
                        </a>
                      )}
                      <Link
                        href={`/projects/${p._id}`}
                        className="bg-black text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-gray-800 transition-colors"
                      >
                        View <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Team row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* SME */}
                    <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="w-7 h-7 bg-green-600 text-white rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">
                        {sme ? (sme.firstName?.[0] || 'C').toUpperCase() : '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">
                          {sme ? `${sme.firstName} ${sme.lastName}` : 'Unknown'}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">SME</p>
                      </div>
                    </div>

                    {/* Student */}
                    <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">
                        {student ? (student.firstName?.[0] || 'S').toUpperCase() : '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">
                          {student ? `${student.firstName} ${student.lastName}` : 'Not assigned'}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Student</p>
                      </div>
                    </div>

                    {/* Mentor */}
                    <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="w-7 h-7 bg-purple-600 text-white rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">
                        {mentor ? (mentor.firstName?.[0] || 'M').toUpperCase() : '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">
                          {mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Not assigned'}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Mentor</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {p.lastActivity && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} />
                        Last activity: {new Date(p.lastActivity).toLocaleDateString()}
                      </span>
                    )}
                    {p.repositoryUrl && (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={11} className="text-green-500" />
                        Repo live
                      </span>
                    )}
                    {!mentor && (
                      <span className="flex items-center gap-1.5 text-orange-500">
                        <AlertTriangle size={11} />
                        No mentor assigned
                      </span>
                    )}
                    {p.status === 'IN_REVIEW' && (
                      <span className="flex items-center gap-1.5 text-yellow-600">
                        <Eye size={11} />
                        Awaiting review
                      </span>
                    )}
                    {p.createdAt && (
                      <span className="flex items-center gap-1.5">
                        Created: {new Date(p.createdAt).toLocaleDateString()}
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
