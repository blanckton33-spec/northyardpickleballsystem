import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, LogOut, ChevronDown } from 'lucide-react';

export const Topbar = ({ title, subtitle, icon: IconComponent, onLogout }) => {
  const { currentUser } = useApp();
  const [now, setNow] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
            flexShrink: 0,
          }}
        >
          {IconComponent ? <IconComponent size={22} /> : '🏓'}
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            {title}
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Date & Time */}
        <div
          style={{
            textAlign: 'right',
            paddingRight: 18,
            borderRight: '1px solid var(--border)',
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
            {formattedTime}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {formattedDate}
          </div>
        </div>

        {/* User Profile */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 12px 6px 6px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              userSelect: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              <User size={18} />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {currentUser?.name || 'Admin'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {currentUser?.role || 'Administrator'}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {dropdownOpen && (
            <div
              className="animate-slide"
              style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 170,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: 6,
                zIndex: 100,
              }}
            >
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout && onLogout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  background: 'none',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--red)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--red-light)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
