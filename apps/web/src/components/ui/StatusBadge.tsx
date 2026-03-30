import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let colorClass = '';
  let Icon = null;

  switch (status) {
    case 'OPEN':
      colorClass = 'bg-blue-50 text-blue-600 border-blue-100';
      Icon = Clock;
      break;
    case 'IN_PROGRESS':
      colorClass = 'bg-orange-50 text-orange-600 border-orange-100';
      Icon = Clock;
      break;
    case 'IN_REVIEW':
      colorClass = 'bg-purple-50 text-purple-600 border-purple-100';
      Icon = AlertTriangle;
      break;
    case 'COMPLETED':
      colorClass = 'bg-green-50 text-green-600 border-green-100';
      Icon = CheckCircle2;
      break;
    default:
      colorClass = 'bg-gray-50 text-gray-600 border-gray-100';
      break;
  }

  return (
    <span className={`px-3 py-1.5 border rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 w-fit ${colorClass}`}>
      {Icon && <Icon size={14} />}
      {status.replace('_', ' ')}
    </span>
  );
}
