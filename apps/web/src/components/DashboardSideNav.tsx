'use client';

import { 
  Inbox,
  Search,
  Briefcase,
  HelpCircle,
  LogOut,
  LayoutDashboard,
  AlertTriangle,
  Shield,
  Users,
  Layers,
  CheckSquare,
  FileText,
  UserCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';
import { getUser } from '../lib/auth';
import { UserRole } from '@boulot/types';

export default function DashboardSideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const role = user?.role;

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard', section: 'MAIN MENU', roles: [UserRole.STUDENT, UserRole.SME, UserRole.MENTOR, UserRole.ADMIN] },
    { name: 'Messages', icon: <Inbox size={20} />, href: '/dashboard/messages', section: 'MAIN MENU', roles: [UserRole.STUDENT, UserRole.SME, UserRole.MENTOR, UserRole.ADMIN] },
    { name: 'Browse', icon: <Search size={20} />, href: '/projects', section: 'MAIN MENU', roles: [UserRole.STUDENT, UserRole.SME, UserRole.MENTOR, UserRole.ADMIN] },
    { name: 'Verify ID', icon: <FileText size={20} />, href: '/dashboard/verify', section: 'MAIN MENU', roles: [UserRole.STUDENT, UserRole.SME, UserRole.MENTOR, UserRole.ADMIN] },

    { name: 'My Projects', icon: <Briefcase size={20} />, href: '/dashboard/projects', section: 'WORK', roles: [UserRole.SME] },
    { name: 'Find Students', icon: <Users size={20} />, href: '/dashboard/students', section: 'WORK', roles: [UserRole.SME] },
    { name: 'My Proposals', icon: <Layers size={20} />, href: '/dashboard/proposals', section: 'WORK', roles: [UserRole.STUDENT] },
    { name: 'My Profile', icon: <UserCircle size={20} />, href: '/dashboard/profile', section: 'WORK', roles: [UserRole.STUDENT] },
    { name: 'Project Tracking', icon: <Eye size={20} />, href: '/dashboard/tracking', section: 'WORK', roles: [UserRole.MENTOR] },
    { name: 'Review Queue', icon: <CheckSquare size={20} />, href: '/dashboard/review', section: 'WORK', roles: [UserRole.MENTOR, UserRole.ADMIN] },
    { name: 'Disputes', icon: <AlertTriangle size={20} />, href: '/dashboard/disputes', section: 'WORK', roles: [UserRole.MENTOR, UserRole.ADMIN] },

    { name: 'Admin', icon: <Shield size={20} />, href: '/dashboard/admin', section: 'ADMIN', roles: [UserRole.ADMIN] },
    { name: 'All Projects', icon: <Briefcase size={20} />, href: '/dashboard/admin/projects', section: 'ADMIN', roles: [UserRole.ADMIN] },
    { name: 'Users', icon: <Users size={20} />, href: '/dashboard/admin/users', section: 'ADMIN', roles: [UserRole.ADMIN] },
    { name: 'Templates', icon: <Layers size={20} />, href: '/dashboard/admin/templates', section: 'ADMIN', roles: [UserRole.ADMIN] },

    { name: 'Help Center', icon: <HelpCircle size={20} />, href: '/help', section: 'PREFERENCES', roles: [UserRole.STUDENT, UserRole.SME, UserRole.MENTOR, UserRole.ADMIN] },
  ].filter((i) => (role ? i.roles.includes(role) : false));

  const sections = Array.from(new Set(menuItems.map((i) => i.section)));

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 py-10 px-6">
      <div className="flex items-center gap-2 mb-12 px-2">
        <div className="w-8 h-8 bg-black flex items-center justify-center rounded-lg">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <span className="text-xl font-bold tracking-tighter">BOULOT</span>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar">
        {sections.map((section) => (
          <div key={section}>
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] mb-4 px-2 uppercase italic">{section}</p>
            <div className="space-y-1">
              {menuItems
                .filter((item) => item.section === section)
                .map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm group ${
                        isActive 
                          ? 'bg-[#d9f99d] text-black shadow-sm' 
                          : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      <span className={`${isActive ? 'text-black' : 'text-gray-400 group-hover:text-black'} transition-colors`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 px-4 py-4 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all font-bold text-sm"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  );
}
