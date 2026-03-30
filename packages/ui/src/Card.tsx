import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export function Card({ noPadding = false, children, style, ...props }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: noPadding ? '0' : '1.5rem',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
