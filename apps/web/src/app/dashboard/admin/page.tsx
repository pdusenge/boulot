'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Users, Layers, CheckSquare, ArrowRight, Briefcase } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserRole } from '@boulot/types';

export default function AdminOverviewPage() {
  const user = getUser();
  if (!user) return null;
  if (user.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
          <h1 className="text-2xl font-black mb-2">Admin access only</h1>
          <p className="text-gray-500 font-medium">You don’t have access to this area.</p>
        </div>
      </div>
    );
  }

  const cards = [
    { title: 'All Projects', desc: 'View every project, status, and team members.', icon: <Briefcase size={20} />, href: '/dashboard/admin/projects' },
    { title: 'Users', desc: 'Search users and change roles.', icon: <Users size={20} />, href: '/dashboard/admin/users' },
    { title: 'Templates', desc: 'Create and edit project templates.', icon: <Layers size={20} />, href: '/dashboard/admin/templates' },
    { title: 'Review Queue', desc: 'Jump into projects awaiting review.', icon: <CheckSquare size={20} />, href: '/dashboard/review' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
          <Shield size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black">Admin</h1>
          <p className="text-gray-500 text-sm font-medium">Operations tools for managing the marketplace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:border-black transition-all group"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-700 mb-6">
              {c.icon}
            </div>
            <h3 className="text-lg font-black mb-2">{c.title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">{c.desc}</p>
            <div className="mt-6 text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 group-hover:text-black transition-colors">
              Open <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

