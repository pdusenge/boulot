'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  MoreVertical,
  Plus,
  Target,
  Zap,
  Star,
  CheckCircle2,
  Briefcase,
  AlertTriangle,
  Inbox
} from 'lucide-react';
import { getUser } from '../../lib/auth';
import { IUser, UserRole } from '@boulot/types';
import { StatCard } from '../../components/ui/StatCard';
import { JobCard } from '../../components/ui/JobCard';
import {
  useGetProjectsQuery,
  useGetMyProjectsQuery,
  useGetMyProposalsQuery,
  useGetOpenDisputesQuery,
  useGetReviewQueueQuery,
  useGetUnreadCountQuery,
} from '../../store/api/apiSlice';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  const role = user?.role;
  const isStudent = role === UserRole.STUDENT;
  const isSme = role === UserRole.SME;
  const isMentorOrAdmin = role === UserRole.MENTOR || role === UserRole.ADMIN;

  const { data: browseProjects = [] } = useGetProjectsQuery();
  const { data: myProjects = [] } = useGetMyProjectsQuery(undefined, { skip: !isSme });
  const { data: myProposals = [] } = useGetMyProposalsQuery(undefined, { skip: !isStudent });
  const { data: disputes = [] } = useGetOpenDisputesQuery(undefined, { skip: !isMentorOrAdmin });
  const { data: reviewQueue = [] } = useGetReviewQueueQuery(undefined, { skip: !isMentorOrAdmin });
  const { data: unread } = useGetUnreadCountQuery(undefined, { skip: !user });

  if (!user) return null;

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="max-w-[1600px] mx-auto space-y-10"
    >
      {/* Welcome Header */}
      <motion.div {...fadeUp} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-gray-400 font-medium">Welcome back, <span className="text-black font-bold">{user.firstName}</span>. Here's what's happening today.</p>
        </div>
        {user.role === UserRole.SME && (
          <button
            onClick={() => router.push('/dashboard/projects/new')}
            className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Post New Project
          </button>
        )}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left and Middle Columns (8 cols) */}
        <div className="xl:col-span-8 space-y-10">
          
          {/* Quick Stats Row */}
          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <motion.div variants={fadeUp}>
               <StatCard
                 label={isSme ? 'My Projects' : isStudent ? 'My Proposals' : 'Review Queue'}
                 value={isSme ? myProjects.length : isStudent ? myProposals.length : reviewQueue.length}
                 colorClass="bg-blue-500"
                 icon={<Briefcase size={20} />}
               />
             </motion.div>
             <motion.div variants={fadeUp}>
               <StatCard
                 label={isMentorOrAdmin ? 'Open Disputes' : 'Open Projects'}
                 value={isMentorOrAdmin ? disputes.length : browseProjects.length}
                 colorClass="bg-orange-500"
                 icon={isMentorOrAdmin ? <AlertTriangle size={20} /> : <Target size={20} />}
               />
             </motion.div>
             <motion.div variants={fadeUp}>
               <StatCard
                 label="Unread Messages"
                 value={unread?.count ?? 0}
                 colorClass="bg-green-500"
                 icon={<Inbox size={20} />}
               />
             </motion.div>
          </motion.div>

          {/* Earnings Chart Widget */}
          <motion.div 
            variants={fadeUp}
            className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm overflow-hidden group"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-bold mb-1">Activity overview</h3>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black tracking-tighter">
                    {isSme ? `${myProjects.length} projects` : isStudent ? `${myProposals.length} proposals` : `${reviewQueue.length} to review`}
                  </span>
                  <div className="flex items-center text-green-500 font-bold text-xs bg-green-50 px-2 py-1 rounded-lg">
                    <TrendingUp size={12} className="mr-1" />
                    live
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-2xl">
                <MoreVertical size={20} className="text-gray-400" />
              </button>
            </div>
            
            {/* Minimal chart placeholder (keep layout, remove fake money) */}
            <div className="h-64 relative mt-4">
               {/* Grid lines */}
               <div className="absolute inset-0 flex flex-col justify-between opacity-5">
                  {[...Array(6)].map((_, i) => <div key={i} className="w-full h-px bg-black" />)}
               </div>
               {/* Labeling */}
               <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-bold text-gray-300 py-1">
                  <span>25k</span><span>20k</span><span>15k</span><span>10k</span><span>5k</span><span>0</span>
               </div>
               
               {/* SVG Visualization */}
               <svg className="w-full h-full pt-2" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d9f99d" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#d9f99d" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 50 180 Q 150 160 250 120 T 450 140 T 650 80 T 850 60 T 1300 40" 
                    fill="transparent" 
                    stroke="#a3e635" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 50 180 Q 150 160 250 120 T 450 140 T 650 80 T 850 60 T 1300 40 V 256 H 50 Z" 
                    fill="url(#chartGradient)"
                  />
                  <circle cx="650" cy="80" r="8" fill="#a3e635" stroke="white" strokeWidth="3" className="drop-shadow-lg" />
               </svg>
            </div>
          </motion.div>

          {/* Bottom Row: Leaderboard & Tracker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Leaderboard */}
            <motion.div variants={fadeUp} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative group">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Leaderboard</h3>
                  <button className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">See All</button>
               </div>
               <div className="space-y-6">
                 {[
                   { name: 'James Brown', points: '328 pt', icon: <Star className="text-yellow-500 fill-current" size={16} /> },
                   { name: 'Ann Septimus', points: '328 pt', icon: <div className="w-4 h-4 rounded-full bg-gray-200" /> },
                   { name: 'Allison Workman', points: '328 pt', icon: <div className="w-4 h-4 rounded-full bg-gray-200" /> }
                 ].map((u, i) => (
                   <div key={i} className="flex items-center justify-between group/row p-2 rounded-2xl hover:bg-gray-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 border border-white shadow-sm rounded-full flex items-center justify-center text-xs font-bold">
                           {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{u.name}</p>
                          <p className="text-xs text-gray-400 font-bold">{u.points}</p>
                        </div>
                      </div>
                      <div className="text-gray-200 group-hover/row:text-black transition-colors">
                        {u.icon}
                      </div>
                   </div>
                 ))}
               </div>
            </motion.div>

            {/* Tracker */}
            <motion.div variants={fadeUp} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Tracker</h3>
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
                      <button className="px-3 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg shadow-sm uppercase tracking-widest">Referred</button>
                      <button className="px-3 py-1.5 text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-widest hover:text-black transition-all">Applied</button>
                  </div>
               </div>
               <div className="space-y-8">
                 {[
                   { user: 'Jameson', action: 'got hired at', target: 'Tunein Radio', time: '2 mins ago', status: 'completed' },
                   { user: 'Ann', action: 'got hired at', target: 'Spotify', time: '10 mins ago', status: 'pending' },
                 ].map((track, i) => (
                   <div key={i} className="flex gap-4 items-start border-l-2 border-gray-50 pl-6 relative">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full border border-white bg-black ring-4 ring-muted" />
                      <div className="flex-1">
                        <p className="text-xs font-medium leading-relaxed">
                          <span className="font-bold text-black">{track.user}</span> {track.action} {' '}
                          <span className="font-bold text-black underline">{track.target}</span>
                        </p>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">{track.time}</p>
                      </div>
                      <div className={`mt-1 ${track.status === 'completed' ? 'text-green-500' : 'text-orange-400 animate-pulse'}`}>
                         {track.status === 'completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      </div>
                   </div>
                 ))}
               </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column (4 cols) - Recommended Jobs */}
        <motion.div 
          variants={fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.6 }}
          className="xl:col-span-4 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative group"
        >
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold tracking-tight">Open projects</h3>
            <button
              onClick={() => router.push('/projects')}
              className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
            >
              See all
            </button>
          </div>

          <div className="space-y-6">
            {browseProjects.slice(0, 5).map((p) => (
              <JobCard
                key={p._id}
                title={p.title}
                company={typeof p.smeId === 'string' ? p.smeId.substring(0, 2).toUpperCase() : 'SME'}
                type="Remote"
                hours="Contract"
                price={p.budget}
                logo={(typeof p.smeId === 'string' ? p.smeId.substring(0, 1) : 'B').toUpperCase()}
              />
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
