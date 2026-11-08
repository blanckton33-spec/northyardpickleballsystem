import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toasts } = useApp();

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => {
        let bg = 'linear-gradient(135deg, #102a1e, #071b15)';
        let border = '1px solid rgba(34,197,94,0.3)';
        let color = '#86efac';
        let Icon = CheckCircle2;

        if (t.type === 'error') {
          bg = 'linear-gradient(135deg, #2e0e0e, #1a0808)';
          border = '1px solid rgba(239,68,68,0.3)';
          color = '#fca5a5';
          Icon = AlertCircle;
        } else if (t.type === 'info') {
          bg = 'linear-gradient(135deg, #0f233a, #081422)';
          border = '1px solid rgba(59,130,246,0.3)';
          color = '#93c5fd';
          Icon = Info;
        }

        return (
          <div
            key={t.id}
            className="animate-pop"
            style={{
              background: bg,
              border,
              color,
              padding: '12px 18px',
              borderRadius: 14,
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 13.5,
              fontWeight: 600,
              maxWidth: 380,
              pointerEvents: 'auto',
            }}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span style={{ color: '#ffffff', flex: 1 }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
};
