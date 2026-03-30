'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Lock } from 'lucide-react';
import { useGetOpenDisputesQuery, useResolveDisputeMutation } from '../../../store/api/apiSlice';
import { getUser } from '../../../lib/auth';
import { UserRole, IDispute } from '@boulot/types';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';

export default function DisputesPage() {
  const user = getUser();
  const isAuthorized = user?.role === UserRole.MENTOR || user?.role === UserRole.ADMIN;
  
  // Conditionally fetch based on authorization
  const { data: disputes = [], isLoading, error, refetch } = useGetOpenDisputesQuery(undefined, {
    skip: !isAuthorized
  });

  const [resolveDispute] = useResolveDisputeMutation();

  const handleResolve = async (id: string, action: 'refund' | 'release' | 'continue') => {
    const resolution = prompt('Enter resolution notes:');
    if (!resolution) return;

    try {
      await resolveDispute({ id, resolution, action }).unwrap();
      alert('Dispute resolved');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve dispute');
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading disputes..." />;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black">Dispute Resolution</h1>
          <p className="text-gray-500 text-sm">Manage and resolve project conflicts.</p>
        </div>
      </div>

      {!isAuthorized ? (
        <div className="bg-gray-50 border border-gray-100 p-8 rounded-3xl text-center">
          <Lock className="mx-auto mb-4 text-gray-400" size={32} />
          <h3 className="font-bold text-lg mb-2">Disputes Dashboard</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Only Mentors and Admins can view the global dispute queue. To raise a dispute for your project, navigate to the specific project page.
          </p>
        </div>
      ) : error ? (
        <ErrorState 
          message="Failed to load disputes. This might be a temporary connection issue." 
          onRetry={() => refetch()} 
        />
      ) : disputes.length === 0 ? (
        <EmptyState 
          icon={AlertTriangle}
          title="No active disputes"
          description="Everything look clear! There are no pending disputes to resolve at this time."
        />
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute: IDispute) => (
            <motion.div 
              key={dispute._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between gap-6"
            >
              <div>
                <div className="mb-3">
                  <StatusBadge status={dispute.status} />
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Project ID: {dispute.projectId}</p>
                <h3 className="font-bold text-lg">Reason: {dispute.reason}</h3>
                <p className="text-sm text-gray-500 mt-2">Raised By: {dispute.raisedBy}</p>
              </div>
              
              <div className="flex flex-col gap-2 min-w-[200px]">
                <button 
                  onClick={() => handleResolve(dispute._id, 'refund')}
                  className="bg-red-50 text-red-600 py-3 px-4 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  Refund SME
                </button>
                <button 
                  onClick={() => handleResolve(dispute._id, 'release')}
                  className="bg-green-50 text-green-600 py-3 px-4 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors"
                >
                  Release to Student
                </button>
                <button 
                  onClick={() => handleResolve(dispute._id, 'continue')}
                  className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                >
                  Return to Progress
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
