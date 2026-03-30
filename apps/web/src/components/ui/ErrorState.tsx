import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-100 text-red-600 p-12 rounded-[32px] text-center max-w-2xl mx-auto shadow-sm">
      <div className="w-16 h-16 bg-red-100 flex items-center justify-center rounded-2xl mx-auto mb-6 text-red-500">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
      <p className="text-sm font-medium opacity-80 mb-8">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all text-sm uppercase tracking-widest"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
