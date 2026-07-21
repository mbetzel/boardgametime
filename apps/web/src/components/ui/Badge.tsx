import React from 'react';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gold',
  size = 'md',
  children,
  style,
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'success':
        return { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' };
      case 'warning':
        return { backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' };
      case 'danger':
        return { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' };
      case 'info':
        return { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)' };
      case 'neutral':
        return { backgroundColor: 'rgba(100, 116, 139, 0.2)', color: '#cbd5e1', border: '1px solid rgba(100, 116, 139, 0.4)' };
      case 'gold':
      default:
        return { backgroundColor: 'rgba(245, 158, 11, 0.25)', color: '#f59e0b', border: '1px solid #f59e0b' };
    }
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '9999px',
    fontWeight: 600,
    fontSize: size === 'sm' ? '0.75rem' : '0.85rem',
    padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    ...getVariantStyles(),
    ...style,
  };

  return <span style={badgeStyle}>{children}</span>;
};
