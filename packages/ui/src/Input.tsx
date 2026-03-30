import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem', width: '100%' }}>
      {label && <label style={{ marginBottom: '0.25rem', fontWeight: 500 }}>{label}</label>}
      <input
        style={{
          padding: '0.5rem',
          borderRadius: '4px',
          border: `1px solid ${error ? 'red' : '#ccc'}`,
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</span>}
    </div>
  );
}
