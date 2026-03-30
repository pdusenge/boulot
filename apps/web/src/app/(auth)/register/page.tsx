'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, User, Mail, Lock, Briefcase, GraduationCap, Users } from 'lucide-react';
import { UserRole } from '@boulot/types';
import { fetchApi } from '@/lib/api';
import { setAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: UserRole.STUDENT,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchApi<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      setAuth(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-20 px-6 bg-[#fafafa] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-1/3 h-1/2 grid-bg opacity-10 rotate-12 -translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-accent opacity-5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Create your account</h1>
          <p className="text-gray-500">Join the automated marketplace for student talent and SMEs.</p>
        </div>

        <div className="bg-white border border-gray-100 shadow-xl rounded-[32px] p-10 relative z-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </div>
                  <input 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jane"
                    required 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 ring-black transition-all outline-none font-medium text-black placeholder:text-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                <input 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required 
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium text-black placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  name="email"
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required 
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 ring-black transition-all outline-none font-medium text-black placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  name="password"
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  required 
                  minLength={8}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 ring-black transition-all outline-none font-medium text-black placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">I am a...</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { role: UserRole.STUDENT, label: 'Student', icon: <GraduationCap size={20} /> },
                  { role: UserRole.SME, label: 'SME / Hiring', icon: <Briefcase size={20} /> },
                  { role: UserRole.MENTOR, label: 'Mentor', icon: <Users size={20} /> },
                ].map((item) => (
                  <label 
                    key={item.role}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.role === item.role ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="role" 
                      value={item.role} 
                      checked={formData.role === item.role}
                      onChange={handleChange}
                      className="absolute opacity-0"
                    />
                    <div className="mb-2">{item.icon}</div>
                    <span className="text-xs font-bold uppercase tracking-tighter">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-4"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-center text-gray-500 font-medium text-sm">
              By joining, you agree to our {' '}
              <Link href="#" className="text-black font-bold hover:underline">Terms</Link> and {' '}
              <Link href="#" className="text-black font-bold hover:underline">Privacy Policy</Link>.
            </p>
            <p className="text-center text-gray-500 font-medium mt-4">
              Already have an account? {' '}
              <Link href="/login" className="text-black font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
