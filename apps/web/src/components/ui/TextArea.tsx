import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full bg-gray-50 border-none rounded-2xl py-4 px-6 
            focus:ring-2 ring-black transition-all outline-none 
            font-medium text-sm placeholder:text-gray-300 resize-none
            ${error ? 'ring-2 ring-red-500' : ''} 
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
