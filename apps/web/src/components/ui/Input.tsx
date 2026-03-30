import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-gray-50 border-none rounded-2xl py-4 
              ${icon ? 'pl-14' : 'px-6'} 
              pr-6 focus:ring-2 ring-black transition-all outline-none 
              font-medium text-sm placeholder:text-gray-300
              ${error ? 'ring-2 ring-red-500' : ''} 
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
