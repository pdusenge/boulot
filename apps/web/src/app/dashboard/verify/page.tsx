'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { getUser, setAuth, getToken } from '../../../lib/auth';
import { IUser } from '@boulot/types';

export default function VerifyIdentityPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const [nationalId, setNationalId] = useState('');
  const [fullName, setFullName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If already verified, show success
  if (user?.isVerified && !success) {
    setSuccess(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const updatedUser = await fetchApi<IUser>('/auth/verify-id', {
        method: 'POST',
        body: JSON.stringify({ nationalId, fullName }),
      });

      if (token && updatedUser) {
        setAuth(token, updatedUser); // Update local storage with verified status
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your ID and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2">Identity Verified!</h2>
          <p className="text-gray-500 mb-8">Your account is now fully active.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all font-outfit"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl max-w-lg w-full"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Verify Identity</h1>
            <p className="text-gray-400 font-medium text-sm">Required for all Boulot users</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="nationalId" className="block text-sm font-bold text-gray-700">
              Rwandan National ID
            </label>
            <input
              id="nationalId"
              type="text"
              required
              placeholder="e.g. 1199..."
              maxLength={16}
              minLength={16}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium text-lg tracking-widest placeholder:tracking-normal"
            />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Must be exactly 16 digits
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-bold text-gray-700">
              Full Legal Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || nationalId.length !== 16 || !fullName}
            className="w-full relative flex items-center justify-center bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Verify via Irembo'
            )}
          </button>
        </form>
        
        <p className="text-center text-xs text-gray-400 mt-6 font-medium leading-relaxed">
          By verifying, you confirm that these details match your official ID. 
          Your data is securely processed via the Irembo integration.
        </p>
      </motion.div>
    </div>
  );
}
