'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getUser } from '@/lib/auth';
import {  UserRole ,TemplateCategory   } from '@boulot/types';
import { useCreateProjectMutation, useGetTemplatesQuery } from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function NewProjectPage() {
  const router = useRouter();
  const user = getUser();

  const isSme = user?.role === UserRole.SME;
  const { data: templates = [], isLoading: templatesLoading } = useGetTemplatesQuery(undefined, {
    skip: !isSme,
  });
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();

  const [templateId, setTemplateId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(100);
  const [skillsText, setSkillsText] = useState('React, Node.js');
  const [templateCategory, setTemplateCategory] = useState<string>('');
  const [error, setError] = useState<string>('');

  const skillsRequired = useMemo(
    () =>
      skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [skillsText]
  );
  const filteredTemplates = useMemo(
    () => (templateCategory ? templates.filter((t) => t.category === templateCategory) : templates),
    [templates, templateCategory]
  );

  if (!user) return null;

  if (!isSme) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
          <h1 className="text-2xl font-black mb-2">SME access only</h1>
          <p className="text-gray-500 font-medium">Only SMEs can post new projects.</p>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const project = await createProject({
        title,
        description,
        budget: Number(budget),
        skillsRequired,
        ...(templateId ? { templateId } : {}),
      }).unwrap();

      router.push(`/projects/${project._id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create project');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight">Post a new project</h1>
        <p className="text-gray-500 font-medium mt-2">Create a project and start collecting student proposals.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        {templatesLoading ? (
          <LoadingSpinner text="Loading templates..." />
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Template Category (optional)</label>
              <select
                value={templateCategory}
                onChange={(e) => {
                  setTemplateCategory(e.target.value);
                  setTemplateId('');
                }}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium"
              >
                <option value="">All categories</option>
                {Object.values(TemplateCategory).map((c) => (
                  <option key={c as string} value={c as string}>
                    {c as string}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Template (optional)</label>
              <select
                value={templateId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setTemplateId(selectedId);
                  if (selectedId) {
                    const tpl = templates.find((t) => t._id === selectedId);
                    if (tpl) {
                      setTitle(tpl.name);
                      setDescription(tpl.description);
                      setBudget(tpl.basePrice);
                      setSkillsText(tpl.skillsRequired.join(', '));
                    }
                  } else {
                    setTitle('');
                    setDescription('');
                    setBudget(100);
                    setSkillsText('React, Node.js');
                  }
                }}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium"
              >
                <option value="">No template</option>
                {filteredTemplates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.category}) — ${t.basePrice} / {t.estimatedDays}d
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={5}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium"
                placeholder="e.g. Build a landing page + signup flow"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={20}
                rows={7}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium resize-none"
                placeholder="What should the student deliver? Include acceptance criteria."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Budget ($)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  required
                  min={10}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Skills (comma-separated)</label>
                <input
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-black transition-all outline-none font-medium"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={creating}
                className="bg-black text-white px-7 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Posting…' : 'Post project'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-7 py-4 rounded-2xl font-bold border border-gray-100 hover:border-black transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}

