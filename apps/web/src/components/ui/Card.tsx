import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  style,
  glow = false,
}) => {
  const cardStyle: React.CSSProperties = {
    background: 'rgba(30, 41, 59, 0.8)',
    backdropFilter: 'blur(12px)',
    border: glow ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(245, 158, 11, 0.15)',
    boxShadow: glow ? '0 0 25px rgba(245, 158, 11, 0.3)' : '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ...style,
  };

  return (
    <div style={cardStyle} className={className}>
      {(title || subtitle) && (
        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
          {title && <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>{subtitle}</p>}
        </div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
      {footer && <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>{footer}</div>}
    </div>
  );
};
