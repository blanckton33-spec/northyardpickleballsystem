import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Play,
  Calendar,
  Layers,
  BarChart3,
  Tv,
  Moon,
  Sun,
  LogOut,
  Users
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, onOpenLiveDisplay, onLogout }) => {
  const { theme, toggleTheme } = useApp();

  const navItems = [
    { id: 'openplay', label: 'Open Play', icon: Play },
    { id: 'courtrental', label: 'Court Rental', icon: Calendar },
    { id: 'paddlerental', label: 'Paddle & Ball Rental', icon: Layers },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <aside
      style={{
        width: 272,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'var(--sidebar-bg)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px',
        borderRight: '1px solid var(--sidebar-border)',
        zIndex: 50,
        overflowY: 'auto',
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '8px 10px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            overflow: 'hidden',
            background: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}
        >
          <img
            src="/North yard.png"
            alt="North Yard"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 800, letterSpacing: 1.2, margin: 0, color: '#fff' }}>
            NORTH YARD
          </h1>
          <p style={{ fontSize: 9.5, opacity: 0.6, letterSpacing: 3, marginTop: 2, fontWeight: 600 }}>
            PICKLEBALL SYSTEM
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#86efac' : 'rgba(255,255,255,0.7)',
                background: isActive
                  ? 'linear-gradient(100deg, rgba(34,197,94,0.22), rgba(34,197,94,0.06))'
                  : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isActive ? 'inset 3px 0 0 #22c55e' : 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              <Icon size={17} style={{ color: isActive ? '#4ade80' : 'rgba(255,255,255,0.7)' }} />
              {item.label}
            </button>
          );
        })}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '10px 4px' }} />

        {/* Shortcut to Live Display View */}
        <button
          onClick={onOpenLiveDisplay}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 16px',
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 700,
            color: '#60a5fa',
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.25)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
        >
          <Tv size={17} style={{ color: '#60a5fa' }} />
          <span>Live Display View</span>
          <span style={{ fontSize: 10, marginLeft: 'auto', background: '#2563eb', color: '#fff', padding: '2px 6px', borderRadius: 6 }}>
            TV / Phone
          </span>
        </button>
      </nav>

      {/* Footer & Dark Mode */}
      <div
        style={{
          paddingTop: 16,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.14)',
            cursor: 'pointer',
            fontSize: 12.5,
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
        >
          {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#cbd5e1" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
          Play · Connect · <strong style={{ color: '#86efac' }}>Enjoy</strong>
          <div style={{ fontSize: 9.5, letterSpacing: 2, marginTop: 2, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
            v2.0 REACT VERCEL
          </div>
        </div>
      </div>
    </aside>
  );
};
