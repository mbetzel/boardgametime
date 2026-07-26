import React from 'react';
import { Button } from '../ui/Button';

export interface TurnConfirmationBarProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  message?: string;
}

export const TurnConfirmationBar: React.FC<TurnConfirmationBarProps> = ({
  onConfirm,
  onCancel,
  isLoading = false,
  message = 'Unconfirmed move staged! Click Confirm to finalize your turn or Cancel to reset.',
}) => {
  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)',
        margin: '0.5rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.4rem' }}>⏳</span>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>
            Turn Confirmation
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            {message}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Button
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={isLoading}
          style={{ borderColor: '#ef4444', color: '#ef4444' }}
        >
          ❌ Cancel Turn
        </Button>
        <Button
          variant="gold"
          size="md"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Confirming...' : '✅ Confirm Turn'}
        </Button>
      </div>
    </div>
  );
};
