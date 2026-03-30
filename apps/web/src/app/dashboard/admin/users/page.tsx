'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Shield } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserRole, IUser } from '@boulot/types';
import { useAdminGetUsersQuery, useAdminUpdateUserRoleMutation } from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';

export default function AdminUsersPage() {
  const me = getUser();
  const [query, setQuery] = useState('');
  const isAdmin = me?.role === UserRole.ADMIN;

  const { data: users = [], isLoading, error, refetch } = useAdminGetUsersQuery(
    { query },
    { skip: !isAdmin }
  );
  const [updateRole, { isLoading: updating }] = useAdminUpdateUserRoleMutation();

  const roleOptions = useMemo(
    () => [UserRole.STUDENT, UserRole.SME, UserRole.MENTOR, UserRole.ADMIN],
    []
  );

  if (!me) return null;
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
          <h1 className="text-2xl font-black mb-2">Admin access only</h1>
          <p className="text-gray-500 font-medium">You don’t have access to this area.</p>
        </div>
      </div>
    );
  }

  const changeRole = async (u: IUser, role: UserRole) => {
    await updateRole({ id: u._id, role }).unwrap();
    refetch();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
          <Users size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black">Users</h1>
          <p className="text-gray-500 text-sm font-medium">Search users and manage roles.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email or name…"
              className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-6 focus:ring-2 ring-black transition-all outline-none font-medium text-sm"
            />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Shield size={14} />
            Admin only
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <LoadingSpinner text="Loading users..." />
          ) : error ? (
            <ErrorState message="Failed to load users." onRetry={() => refetch()} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <th className="text-left py-3">User</th>
                    <th className="text-left py-3">Email</th>
                    <th className="text-left py-3">Role</th>
                    <th className="text-right py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t border-gray-100">
                      <td className="py-4 font-bold">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="py-4 text-gray-600 font-medium">{u.email}</td>
                      <td className="py-4">
                        <select
                          className="bg-gray-50 rounded-xl px-3 py-2 font-bold text-xs"
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value as UserRole)}
                          disabled={updating}
                        >
                          {roleOptions.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 text-right text-xs text-gray-400 font-bold uppercase tracking-widest">
                        {u._id === me._id ? 'You' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

