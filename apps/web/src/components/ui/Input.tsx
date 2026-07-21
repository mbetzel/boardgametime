import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  style,
  className = '',
  ...props
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#cbd5e1',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.9rem',
    borderRadius: '8px',
    backgroundColor: '#0f172a',
    border: error ? '1px solid #ef4444' : '1px solid #334155',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    ...style,
  };

  return (
    <div style={containerStyle} className={className}>
      {label && <label style={labelStyle}>{label}</label>}
      <input style={inputStyle} {...props} />
      {error && <span style={{ fontSize: '0.775rem', color: '#f87171' }}>{error}</span>}
      {!error && helperText && <span style={{ fontSize: '0.775rem', color: '#64748b' }}>{helperText}</span>}
    </div>
  );
};
