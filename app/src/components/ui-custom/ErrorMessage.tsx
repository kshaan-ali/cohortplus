import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string | null;
  className?: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, className, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={className}
      style={{
        marginBottom: 16,
        padding: '16px 24px',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#FCA5A5' }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: 'var(--theme-muted)',
            flexShrink: 0
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
