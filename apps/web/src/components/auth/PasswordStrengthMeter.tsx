import React from 'react';

export interface PasswordCriterion {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrengthProps {
  password: string;
}

export function checkPasswordStrength(password: string) {
  const criteria: PasswordCriterion[] = [
    { id: 'minChar', label: 'Min 8 characters', met: password.length >= 8 },
    { id: 'uppercase', label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { id: 'number', label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { id: 'special', label: 'Special character (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = criteria.filter((c) => c.met).length;
  return { criteria, metCount, isAllMet: metCount === 5 };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthProps> = ({ password }) => {
  const { criteria, metCount } = checkPasswordStrength(password);

  const getStrengthLabel = () => {
    if (!password) return { label: 'Required', color: '#64748b' };
    switch (metCount) {
      case 0:
      case 1:
        return { label: 'Very Weak', color: '#ef4444' };
      case 2:
        return { label: 'Weak', color: '#f97316' };
      case 3:
        return { label: 'Fair', color: '#eab308' };
      case 4:
        return { label: 'Good', color: '#84cc16' };
      case 5:
        return { label: 'Strong', color: '#10b981' };
      default:
        return { label: 'Weak', color: '#ef4444' };
    }
  };

  const strengthInfo = getStrengthLabel();
  const percentage = (metCount / 5) * 100;

  return (
    <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Password Strength
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: strengthInfo.color }}>
          {strengthInfo.label}
        </span>
      </div>

      {/* Progress Bar Background */}
      <div
        style={{
          height: '6px',
          width: '100%',
          backgroundColor: '#334155',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '0.75rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: strengthInfo.color,
            transition: 'width 0.3s ease, background-color 0.3s ease',
            borderRadius: '3px',
          }}
        />
      </div>

      {/* 5 Standards Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem 0.5rem' }}>
        {criteria.map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: item.met ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                color: item.met ? '#10b981' : '#64748b',
                border: item.met ? '1px solid #10b981' : '1px solid #475569',
              }}
            >
              {item.met ? '✓' : '•'}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: item.met ? '#cbd5e1' : '#64748b',
                transition: 'color 0.2s ease',
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
