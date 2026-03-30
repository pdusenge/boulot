'use client';

import DashboardSideNav from '@/components/DashboardSideNav';
import DashboardTopBar from '@/components/DashboardTopBar';
import { getUser } from '@/lib/auth';
import { UserRole } from '@boulot/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getUser();
  const pathname = usePathname();
  const allowedWhileUnverified = ['/dashboard/verify', '/dashboard/profile'];
  const blockForUnverified =
    !!user && user.role !== UserRole.ADMIN && !user.isVerified && !allowedWhileUnverified.includes(pathname);

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <DashboardSideNav />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto custom-scrollbar pt-10 pb-20 px-10">
          {blockForUnverified ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
                <h1 className="text-2xl font-black mb-2">ID verification required</h1>
                <p className="text-gray-500 font-medium mb-6">
                  Verify your national ID to access your portal and continue with projects.
                </p>
                <Link
                  href="/dashboard/verify"
                  className="inline-flex bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all"
                >
                  Go to verification
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
