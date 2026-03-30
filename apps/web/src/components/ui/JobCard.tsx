import { ArrowUpRight } from 'lucide-react';

interface JobCardProps {
  title: string;
  company: string;
  type: string;
  hours: string;
  price: string | number;
  logo: string;
  timeAgo?: string;
}

export function JobCard({ title, company, type, hours, price, logo, timeAgo = 'JUST NOW' }: JobCardProps) {
  return (
    <div className="group/job p-6 border border-gray-50 rounded-[32px] hover:border-black hover:shadow-xl transition-all relative overflow-hidden flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center font-black text-xl text-gray-400 group-hover/job:bg-black group-hover/job:text-white transition-colors">
            {logo}
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight">{title}</h4>
            <p className="text-xs text-gray-400 font-bold">{company} • {type}</p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-accent/10 text-accent rounded-xl text-[10px] font-black uppercase tracking-widest">
          ${price}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2">
         <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-bold uppercase tracking-widest">{hours}</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">{timeAgo}</span>
         </div>
         <button className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all">
            <ArrowUpRight size={14} />
         </button>
      </div>
    </div>
  );
}
