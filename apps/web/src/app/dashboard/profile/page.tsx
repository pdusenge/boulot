'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserCircle, ExternalLink, Save } from 'lucide-react';
import { getUser, setAuth, checkAuth, getToken } from '@/lib/auth';
import { UserRole } from '@boulot/types';
import { useUpdateProfileMutation } from '@/store/api/apiSlice';

export default function StudentProfilePage() {
  const user = getUser();
  const isStudent = user?.role === UserRole.STUDENT;

  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fresh = await checkAuth();
      if (cancelled || !fresh) return;
      setBio(fresh.bio || '');
      setSkillsText((fresh.skills || []).join(', '));
      setGithubUsername(fresh.githubUsername || '');
      setPhone(fresh.phone || '');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;

  if (!isStudent) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
          <h1 className="text-2xl font-black mb-2">Student profile</h1>
          <p className="text-gray-500 font-medium">This editor is for students building a public portfolio.</p>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const updated = await updateProfile({
        bio: bio.trim(),
        skills,
        githubUsername: githubUsername.trim(),
        phone: phone.trim(),
      }).unwrap();
      const token = getToken();
      if (token) setAuth(token, updated);
      setSaved(true);
    } catch (err: any) {
      const msg =
        err?.data?.issues?.[0]?.message ||
        err?.data?.error ||
        err?.message ||
        'Could not save profile';
      setError(typeof msg === 'string' ? msg : 'Could not save profile');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
          <UserCircle size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black">My profile</h1>
          <p className="text-gray-500 text-sm font-medium">
            SMEs see this when they review proposals — highlight skills, GitHub, and your story.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-sm">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-100 text-green-700 p-4 rounded-2xl text-sm font-medium">
            Profile saved.
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Public portfolio</p>
              <p className="text-sm text-gray-600 font-medium mt-1">Preview how clients see your track record.</p>
            </div>
            <Link
              href={`/portfolio/${user._id}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-black border border-gray-100 hover:border-black transition-colors"
            >
              Open public page <ExternalLink size={14} />
            </Link>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
              placeholder="What you build, tools you like, and what you want to work on next."
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium text-sm resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Skills (comma-separated)</label>
            <input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium"
              placeholder="React, TypeScript, Node.js, MongoDB"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">GitHub username</label>
              <input
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium"
                placeholder="octocat"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Phone (optional)</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium"
                placeholder="+250 …"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {isLoading ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
