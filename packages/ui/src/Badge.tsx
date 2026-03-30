import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
}

export function Badge({ color = 'gray', children, style, ...props }: BadgeProps) {
  const colors: Record<string, React.CSSProperties> = {
    green: { backgroundColor: '#e6fffa', color: '#276749' },
    blue: { backgroundColor: '#ebf8ff', color: '#2b6cb0' },
    yellow: { backgroundColor: '#fffff0', color: '#975a16' },
    red: { backgroundColor: '#fff5f5', color: '#c53030' },
    gray: { backgroundColor: '#edf2f7', color: '#4a5568' },
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        ...colors[color],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
