export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      {text && (
        <p className="font-bold uppercase tracking-widest text-xs text-gray-400">
          {text}
        </p>
      )}
    </div>
  );
}
