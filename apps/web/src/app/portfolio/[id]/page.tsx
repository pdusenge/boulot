'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Award, Code, CheckCircle, Flame, Star } from 'lucide-react';
import { useGetPublicPortfolioQuery } from '../../../store/api/apiSlice';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { IProject } from '@boulot/types';

export default function PublicPortfolioPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: profile, isLoading, error } = useGetPublicPortfolioQuery(id as string, {
    skip: !id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <LoadingSpinner text="Loading Developer Profile..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm max-w-md">
          <h2 className="text-3xl font-black mb-4">Portfolio Not Found</h2>
          <p className="text-gray-500 mb-6 font-medium">This developer either doesn't exist or hasn't completed any projects yet.</p>
          <button onClick={() => router.push('/')} className="bg-black text-white px-6 py-4 rounded-xl font-bold w-full uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const { studentInfo, portfolio } = profile;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      {/* Hero Header */}
      <section className="bg-black text-white pt-40 pb-20 px-6 relative overflow-hidden rounded-b-[60px]">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-grid-white/[0.05] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="w-24 h-24 bg-white/10 mx-auto rounded-3xl flex items-center justify-center mb-6 ring-4 ring-white/5">
            <span className="text-4xl font-black uppercase text-white shadow-sm">
              {studentInfo.firstName?.[0]}{studentInfo.lastName?.[0]}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-sm">
            {studentInfo.firstName} {studentInfo.lastName}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <span className="px-5 py-2.5 bg-white/10 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-200 shadow-inner">
              {portfolio.tier} Developer
            </span>
            {studentInfo.isVerified && (
              <span className="px-5 py-2.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-inner">
                <CheckCircle size={14} /> ID Verified
              </span>
            )}
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {studentInfo.bio || 'A passionate student developer continuously learning and building.'}
          </p>
        </div>
      </section>

      {/* Stats & Skills */}
      <section className="px-6 -mt-10 relative z-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-4xl font-black">{portfolio.totalCompleted || 0}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Projects Completed</p>
          </div>
          
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
              <Flame size={24} />
            </div>
            <h3 className="text-4xl font-black">{portfolio.completionRate || 0}%</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Completion Rate</p>
          </div>
          
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4">
              <Award size={24} />
            </div>
            <h3 className="text-4xl font-black">{portfolio.skillBadges?.length || 0}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Earned Badges</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 pt-20 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          {/* Completed Projects */}
          <div className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm">
            <h2 className="text-2xl font-black mb-10 flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-2xl text-gray-400"><Code size={20} /></div>
              Completed Work
            </h2>
            {portfolio.completedProjects && portfolio.completedProjects.length > 0 ? (
              <div className="space-y-6">
                {portfolio.completedProjects.map((proj: any, idx: number) => (
                  <div key={idx} className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:bg-white hover:border-black group">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-black transition-colors">{proj.title}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
                      Signed Off: {new Date(proj.completedAt).toLocaleDateString()}
                    </p>
                    <div className="flex text-yellow-500 gap-1 drop-shadow-sm">
                      <Star size={16} className="fill-current" />
                      <Star size={16} className="fill-current" />
                      <Star size={16} className="fill-current" />
                      <Star size={16} className="fill-current" />
                      <Star size={16} className="fill-current" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                 <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No verified work history yet</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-8 relative">
          <div className="sticky top-32 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black mb-8">Verified Skills</h3>
            <div className="flex flex-wrap gap-3">
              {studentInfo.skills && studentInfo.skills.length > 0 ? (
                studentInfo.skills.map((skill: string) => (
                  <span key={skill} className="bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 capitalize hover:border-black transition-colors cursor-default">
                    {skill}
                  </span>
                ))
              ) : (
                <div className="w-full text-center py-6 bg-gray-50 rounded-2xl">
                   <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">No skills tagged</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
