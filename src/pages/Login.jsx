import React, { useState } from 'react';

export const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@pickleball.local');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, name: email.split('@')[0], role: 'Administrator' });
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* LEFT SIDE: Brand Showcase */}
      <div
        style={{
          flex: '1 1 50%',
          background: 'linear-gradient(180deg, #071b15 0%, #0d2b20 60%, #061811 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        {/* Background Logo at 15% opacity */}
        <img
          src="/North_yarn.png"
          alt="North Yard Watermark"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '110%',
            maxWidth: 650,
            opacity: 0.12,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 440 }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 24,
              overflow: 'hidden',
              background: '#ffffff',
              margin: '0 auto 28px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src="/North yarn.png"
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: 2, margin: 0, color: '#ffffff' }}>
            NORTH YARD
          </h1>
          <p style={{ fontSize: 13, letterSpacing: 5, opacity: 0.65, margin: '4px 0 28px', fontWeight: 600 }}>
            PICKLE BALL SYSTEM
          </p>

          <div style={{ fontSize: 32, fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
            Play · Connect · <strong style={{ color: '#86efac', fontWeight: 800 }}>Enjoy</strong>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div
        style={{
          flex: '1 1 50%',
          background: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <div
          className="card animate-pop"
          style={{
            width: '100%',
            maxWidth: 420,
            padding: 36,
            borderRadius: 24,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Welcome Back!
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 24px' }}>
            Sign in to access North Yard court &amp; queue management
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-main)' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@pickleball.local"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  marginTop: 6,
                  fontSize: 13.5,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-main)' }}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  marginTop: 6,
                  fontSize: 13.5,
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 14,
                fontWeight: 700,
                marginTop: 8,
              }}
            >
              Sign In to System
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            Demo Mode: Pre-filled credentials. Click <strong>Sign In</strong> to proceed.
          </div>
        </div>
      </div>
    </div>
  );
};
