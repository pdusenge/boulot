import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', isLoading, children, style, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    opacity: isLoading || props.disabled ? 0.7 : 1,
    minWidth: '100px',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#0070f3', color: 'white' },
    secondary: { backgroundColor: '#eaeaea', color: '#333' },
    danger: { backgroundColor: '#e00', color: 'white' },
  };

  return (
    <button style={{ ...baseStyle, ...variants[variant], ...style }} disabled={isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
