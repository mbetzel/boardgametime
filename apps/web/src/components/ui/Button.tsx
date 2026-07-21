import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'gold',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          border: '1px solid #60a5fa',
        };
      case 'secondary':
        return {
          backgroundColor: '#334155',
          color: '#f8fafc',
          border: '1px solid #475569',
        };
      case 'danger':
        return {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '1px solid #f87171',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: '#f59e0b',
          border: '1px solid #f59e0b',
        };
      case 'gold':
      default:
        return {
          backgroundColor: '#f59e0b',
          color: '#0f172a',
          fontWeight: '700',
          border: '1px solid #fbbf24',
          boxShadow: '0 0 15px rgba(245, 158, 11, 0.25)',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '0.35rem 0.75rem', fontSize: '0.85rem' };
      case 'lg':
        return { padding: '0.75rem 1.75rem', fontSize: '1.1rem' };
      case 'md':
      default:
        return { padding: '0.5rem 1.25rem', fontSize: '0.95rem' };
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: 'all 0.2s ease-in-out',
    width: fullWidth ? '100%' : 'auto',
    gap: '0.5rem',
    outline: 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <button disabled={disabled || isLoading} style={baseStyle} className={className} {...props}>
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
          }}
        />
      ) : null}
      {children}
    </button>
  );
};
