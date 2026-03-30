'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Star, Award, TrendingUp } from 'lucide-react';
import { useSearchStudentsQuery } from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getUser } from '@/lib/auth';
import { UserRole } from '@boulot/types';

export default function FindStudentsPage() {
  const router = useRouter();
  const user = getUser();

  const [skill, setSkill] = useState('');
  const [tier, setTier] = useState('');
  const [minCompletionRate, setMinCompletionRate] = useState(0);

  const { data: students = [], isLoading, error } = useSearchStudentsQuery(
    {
      ...(skill ? { skill } : {}),
      ...(tier ? { tier } : {}),
      ...(minCompletionRate > 0 ? { minCompletionRate } : {}),
    },
  );

  if (!user || user.role !== UserRole.SME) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
          <h1 className="text-2xl font-black mb-2">SME access only</h1>
          <p className="text-gray-500 font-medium">Only SMEs can search for students.</p>
        </div>
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    APPRENTICE: 'bg-gray-100 text-gray-700',
    INTERMEDIATE: 'bg-blue-100 text-blue-700',
    PRO: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight">Find Students</h1>
        <p className="text-gray-500 font-medium mt-2">Search and filter students by skill badges, tier, and completion rate.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Skill</label>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g. React, Python, Node.js"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-10 pr-6 focus:ring-2 ring-black transition-all outline-none font-medium text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium text-sm"
            >
              <option value="">All tiers</option>
              <option value="APPRENTICE">Apprentice</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="PRO">Pro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
              Min Completion Rate: {minCompletionRate}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={minCompletionRate}
              onChange={(e) => setMinCompletionRate(Number(e.target.value))}
              className="w-full mt-3 accent-black"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner text="Searching students..." />
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-sm font-medium">
          Failed to load students. Please try again.
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[32px] p-12 shadow-sm text-center">
          <p className="text-gray-400 font-bold text-lg">No students found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student: any) => (
            <motion.div
              key={student._id || student.studentId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => router.push(`/portfolio/${student.studentId || student._id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${tierColors[student.tier] || tierColors.APPRENTICE}`}>
                  {student.tier || 'APPRENTICE'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500">
                      {student.totalCompleted || 0} projects completed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500">
                      {student.completionRate || 0}% completion rate
                    </span>
                  </div>
                </div>
              </div>

              {student.skillBadges && student.skillBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {student.skillBadges.slice(0, 5).map((badge: any, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                      {badge.skill} ({badge.projectCount})
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                  View Full Portfolio →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
