'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserRole, ITemplate, TemplateCategory } from '@boulot/types';
import {
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useGetTemplatesQuery,
  useUpdateTemplateMutation,
} from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';

export default function AdminTemplatesPage() {
  const me = getUser();
  const isAdmin = me?.role === UserRole.ADMIN;

  const { data: templates = [], isLoading, error, refetch } = useGetTemplatesQuery(undefined, { skip: !isAdmin });
  const [createTemplate, { isLoading: creating }] = useCreateTemplateMutation();
  const [updateTemplate, { isLoading: updating }] = useUpdateTemplateMutation();
  const [deleteTemplate, { isLoading: deleting }] = useDeleteTemplateMutation();

  const [draft, setDraft] = useState<Partial<ITemplate>>({
    name: '',
    description: '',
    category: TemplateCategory.WEB,
    skillsRequired: [],
    estimatedDays: 7,
    basePrice: 100,
    repositoryTemplate: '',
  });

  const canSubmit = useMemo(() => !!draft.name && !!draft.description && !!draft.category, [draft]);

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

  const submit = async () => {
    if (!canSubmit) return;
    await createTemplate({
      name: draft.name,
      description: draft.description,
      category: draft.category,
      skillsRequired: draft.skillsRequired || [],
      estimatedDays: Number(draft.estimatedDays || 1),
      basePrice: Number(draft.basePrice || 1),
      repositoryTemplate: draft.repositoryTemplate || undefined,
    }).unwrap();
    setDraft({
      name: '',
      description: '',
      category: TemplateCategory.WEB,
      skillsRequired: [],
      estimatedDays: 7,
      basePrice: 100,
      repositoryTemplate: '',
    });
    refetch();
  };

  const updateField = async (t: ITemplate, patch: Partial<ITemplate>) => {
    await updateTemplate({ id: t._id, body: patch }).unwrap();
    refetch();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await deleteTemplate({ id }).unwrap();
    refetch();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
          <Layers size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black">Templates</h1>
          <p className="text-gray-500 text-sm font-medium">Manage project templates for SMEs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Create template</p>
          <div className="space-y-4">
            <input
              value={draft.name || ''}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Name"
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 focus:ring-2 ring-black transition-all outline-none font-medium text-sm"
            />
            <select
              value={draft.category || TemplateCategory.WEB}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as TemplateCategory }))}
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 focus:ring-2 ring-black transition-all outline-none font-medium text-sm"
            >
              {Object.values(TemplateCategory).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <textarea
              value={draft.description || ''}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Description"
              rows={5}
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 focus:ring-2 ring-black transition-all outline-none font-medium text-sm resize-none"
            />
            <input
              value={(draft.skillsRequired || []).join(', ')}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  skillsRequired: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="Skills (comma-separated)"
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 focus:ring-2 ring-black transition-all outline-none font-medium text-sm"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={Number(draft.estimatedDays || 1)}
                onChange={(e) => setDraft((d) => ({ ...d, estimatedDays: Number(e.target.value) }))}
                placeholder="Days"
                min={1}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 focus:ring-2 ring-black transition-all outline-none font-medium text-sm"
              />
              <input
                type="number"
                value={Number(draft.basePrice || 1)}
                onChange={(e) => setDraft((d) => ({ ...d, basePrice: Number(e.target.value) }))}
                placeholder="Base price"
                min={1}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 focus:ring-2 ring-black transition-all outline-none font-medium text-sm"
              />
            </div>
            <input
              value={draft.repositoryTemplate || ''}
              onChange={(e) => setDraft((d) => ({ ...d, repositoryTemplate: e.target.value }))}
              placeholder="GitHub template repo URL (optional)"
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 focus:ring-2 ring-black transition-all outline-none font-medium text-sm"
            />
            <button
              type="button"
              disabled={!canSubmit || creating}
              onClick={submit}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Existing templates</p>
          {isLoading ? (
            <LoadingSpinner text="Loading templates..." />
          ) : error ? (
            <ErrorState message="Failed to load templates." onRetry={() => refetch()} />
          ) : templates.length === 0 ? (
            <div className="text-sm text-gray-500 font-medium">No templates yet.</div>
          ) : (
            <div className="space-y-4">
              {templates.map((t) => (
                <div key={t._id} className="border border-gray-100 rounded-3xl p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          className="font-black text-lg bg-transparent outline-none border-b border-transparent focus:border-black transition-colors w-full"
                          defaultValue={t.name}
                          onBlur={(e) => updateField(t, { name: e.target.value })}
                          disabled={updating}
                        />
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                          className="bg-gray-50 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-black"
                          defaultValue={t.category}
                          onChange={(e) => updateField(t, { category: e.target.value as TemplateCategory })}
                          disabled={updating}
                        >
                          {Object.values(TemplateCategory).map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <input
                          className="bg-gray-50 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-black"
                          defaultValue={t.repositoryTemplate || ''}
                          placeholder="Repository template URL"
                          onBlur={(e) => updateField(t, { repositoryTemplate: e.target.value || undefined })}
                          disabled={updating}
                        />
                      </div>
                      <textarea
                        className="mt-4 w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-black resize-none"
                        rows={4}
                        defaultValue={t.description}
                        onBlur={(e) => updateField(t, { description: e.target.value })}
                        disabled={updating}
                      />
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          className="bg-gray-50 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-black"
                          defaultValue={t.estimatedDays}
                          onBlur={(e) => updateField(t, { estimatedDays: Number(e.target.value) as any })}
                          disabled={updating}
                        />
                        <input
                          type="number"
                          className="bg-gray-50 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-black"
                          defaultValue={t.basePrice}
                          onBlur={(e) => updateField(t, { basePrice: Number(e.target.value) as any })}
                          disabled={updating}
                        />
                      </div>
                      <input
                        className="mt-4 w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-black"
                        defaultValue={t.skillsRequired.join(', ')}
                        onBlur={(e) =>
                          updateField(t, {
                            skillsRequired: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        disabled={updating}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(t._id)}
                      disabled={deleting}
                      className="shrink-0 w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

