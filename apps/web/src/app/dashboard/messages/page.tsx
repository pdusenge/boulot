'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Inbox, Send, ArrowRight } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { getSocket, joinProject, leaveProject } from '@/lib/socket';
import {
  useGetMyWorkProjectsQuery,
  useSendMessageMutation,
  useGetProjectMessagesQuery,
  useGetProjectParticipantsQuery,
} from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DashboardMessagesPage() {
  const user = getUser();
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [receiverId, setReceiverId] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const { data: myProjects = [], isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useGetMyWorkProjectsQuery(
    undefined,
    { skip: !user }
  );

  const selectedProjectId = useMemo(() => activeProjectId || (myProjects[0]?._id ?? ''), [activeProjectId, myProjects]);

  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useGetProjectMessagesQuery({ projectId: selectedProjectId }, { skip: !user || !selectedProjectId });
  const { data: participants = [] } = useGetProjectParticipantsQuery(
    { projectId: selectedProjectId },
    { skip: !user || !selectedProjectId }
  );

  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const [liveMessages, setLiveMessages] = useState<any[]>([]);

  // Subscribe to real-time messages via Socket.IO
  useEffect(() => {
    if (!selectedProjectId) return;
    setLiveMessages([]);
    joinProject(selectedProjectId);

    const socket = getSocket();
    if (!socket) return;

    const handler = (msg: any) => {
      if (msg.projectId === selectedProjectId) {
        setLiveMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('message:project', handler);

    return () => {
      socket.off('message:project', handler);
      leaveProject(selectedProjectId);
    };
  }, [selectedProjectId]);

  const allMessages = useMemo(() => {
    const existingIds = new Set(messages.map((m: any) => m._id));
    const newOnly = liveMessages.filter((m) => !existingIds.has(m._id));
    return [...messages, ...newOnly];
  }, [messages, liveMessages]);

  if (!user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !receiverId || !content.trim()) return;
    await sendMessage({ projectId: selectedProjectId, receiverId, content }).unwrap();
    setContent('');
    refetchMessages();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
          <Inbox size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black">Messages</h1>
          <p className="text-gray-500 text-sm font-medium">Project chats (MVP).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Projects</p>
          {projectsLoading ? (
            <LoadingSpinner text="Loading projects..." />
          ) : projectsError ? (
            <ErrorState message="Failed to load projects." onRetry={() => refetchProjects()} />
          ) : myProjects.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No projects available"
              description="Create a project first to start messaging."
            />
          ) : (
            <div className="space-y-2">
              {myProjects.map((p) => {
                const active = (selectedProjectId || '') === p._id;
                return (
                  <button
                    key={p._id}
                    onClick={() => setActiveProjectId(p._id)}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                      active ? 'bg-[#d9f99d] text-black' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-sm">{p.title}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                      {p.status} • ${p.budget}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {selectedProjectId ? `Project: ${selectedProjectId}` : 'Select a project'}
            </div>
            {selectedProjectId && (
              <Link
                href={`/projects/${selectedProjectId}`}
                className="text-xs font-bold text-black hover:underline flex items-center gap-2"
              >
                Open project <ArrowRight size={14} />
              </Link>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 bg-gray-50 border border-gray-100 rounded-3xl p-4">
            {!selectedProjectId ? (
              <div className="text-sm text-gray-500 font-medium">Pick a project to view messages.</div>
            ) : messagesLoading ? (
              <div className="text-sm text-gray-500 font-medium">Loading messages…</div>
            ) : messagesError ? (
              <button onClick={() => refetchMessages()} className="text-sm font-bold underline">
                Failed to load messages. Retry
              </button>
            ) : allMessages.length === 0 ? (
              <div className="text-sm text-gray-500 font-medium">No messages yet.</div>
            ) : (
              allMessages.map((m: any) => {
                const mine = m.senderId === user._id;
                return (
                  <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium ${
                        mine ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">
                        {mine ? 'You' : m.senderId}
                      </div>
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={submit} className="mt-4 flex flex-col md:flex-row gap-3">
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="bg-gray-50 border-none rounded-2xl py-3 px-4 focus:ring-2 ring-black transition-all outline-none font-medium text-sm flex-1"
              disabled={!selectedProjectId}
            >
              <option value="">Select receiver</option>
              {participants
                .filter((p) => p.id !== user._id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.role})
                  </option>
                ))}
            </select>
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message…"
              className="bg-gray-50 border-none rounded-2xl py-3 px-4 focus:ring-2 ring-black transition-all outline-none font-medium text-sm flex-[2]"
              disabled={!selectedProjectId}
            />
            <button
              type="submit"
              disabled={!selectedProjectId || sending || !receiverId || !content.trim()}
              className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

