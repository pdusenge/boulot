interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}

export function StatCard({ label, value, icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
      <div className={`w-14 h-14 ${colorClass} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-black tracking-tighter text-black">{value}</p>
      </div>
    </div>
  );
}
