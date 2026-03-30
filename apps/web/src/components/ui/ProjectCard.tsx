import Link from 'next/link';
import { Briefcase, Clock, ArrowRight } from 'lucide-react';
import { IProject } from '@boulot/types';

interface ProjectCardProps {
  project: IProject;
  detailsHref?: string;
}

export function ProjectCard({ project, detailsHref }: ProjectCardProps) {
  return (
    <div className="group bg-white border border-gray-100 rounded-[32px] p-8 hover:border-black hover:shadow-2xl transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-colors">
          <Briefcase size={24} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-black tracking-tighter">${project.budget}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Budget</span>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-4 line-clamp-2 leading-tight group-hover:text-black transition-colors">
        {project.title}
      </h3>
      
      <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-3">
        {project.description}
      </p>

      <div className="space-y-6 mt-auto">
        <div className="flex flex-wrap gap-2">
          {project.skillsRequired?.map((skill) => (
            <span key={skill} className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-500 border border-transparent group-hover:border-gray-100">
              {skill}
            </span>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Active Now</span>
          </div>
          <Link href={detailsHref || `/projects/${project._id}`}>
            <button className="flex items-center gap-2 text-sm font-bold hover:translate-x-1 transition-transform">
              View Details <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
