'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen } from 'lucide-react';
import { useGetProjectsQuery } from '../../store/api/apiSlice';
import { ProjectCard } from '../../components/ui/ProjectCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { IProject } from '@boulot/types';

export default function ProjectsPage() {
  const { data: projects = [], isLoading, error, refetch } = useGetProjectsQuery();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p: IProject) => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.skillsRequired?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading Opportunities..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-100 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 mt-1.5">Available <br /><span className="text-gray-400">Projects.</span></h1>
            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
              Find real-world projects from verified SMEs. Build your professional portfolio while earning and learning.
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by title, skill, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-6 focus:ring-2 ring-black transition-all outline-none font-medium"
              />
            </div>
            <button className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-3 font-bold hover:border-black transition-all">
              <Filter size={20} />
              Filters
            </button>
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {error ? (
            <ErrorState 
              message="Failed to load projects. This might be a temporary connection issue." 
              onRetry={() => refetch()} 
            />
          ) : filteredProjects.length === 0 ? (
            <EmptyState 
              icon={BookOpen}
              title="No projects found"
              description="Try adjusting your search or check back later for new opportunities."
            />
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProjects.map((project: IProject) => (
                <motion.div key={project._id} variants={item}>
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
