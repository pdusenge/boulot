import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-32 bg-white border border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 bg-gray-50 flex items-center justify-center rounded-3xl mb-6 text-gray-300">
        <Icon size={40} />
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm mx-auto mb-8 font-medium">{description}</p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
