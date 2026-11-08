import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Layers, Plus, Search, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';

export const PaddleRentals = () => {
  const { paddleRentals, addPaddleRental, returnPaddleRental, deletePaddleRental } = useApp();

  const [customer, setCustomer] = useState('');
  const [contact, setContact] = useState('');
  const [paddles, setPaddles] = useState(2);
  const [balls, setBalls] = useState(2);
  const [paddleRate, setPaddleRate] = useState(50);
  const [ballRate, setBallRate] = useState(20);
  const [returnTime, setReturnTime] = useState('18:00');
  const [search, setSearch] = useState('');

  const totalAmount = Number(paddles || 0) * Number(paddleRate || 0) + Number(balls || 0) * Number(ballRate || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer.trim()) return;

    addPaddleRental({
      customer,
      contact_number: contact,
      paddles,
      balls,
      paddle_rate: paddleRate,
      ball_rate: ballRate,
      return_time: returnTime,
    });

    setCustomer('');
    setContact('');
  };

  const filtered = paddleRentals.filter(r =>
    r.customer.toLowerCase().includes(search.toLowerCase()) ||
    r.contact_number?.includes(search)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Active Rentals
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              {paddleRentals.filter(r => r.status === 'Rented').length}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Paddles in play
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🏸
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Paddles Out
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              {paddleRentals.filter(r => r.status === 'Rented').reduce((sum, r) => sum + (Number(r.paddles) || 0), 0)}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Currently borrowed
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            💰
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Equipment Revenue
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              ₱{paddleRentals.reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString()}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Paddles &amp; balls
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Form & Table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            🏸 Paddle &amp; Ball Rental
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Record paddle and ball rentals for players.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Customer Name *</label>
              <input
                type="text"
                required
                placeholder="Full name"
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Contact Number</label>
              <input
                type="tel"
                placeholder="09xx xxx xxxx"
                value={contact}
                onChange={e => setContact(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Paddles *</label>
                <input
                  type="number"
                  min="0"
                  value={paddles}
                  onChange={e => setPaddles(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Balls *</label>
                <input
                  type="number"
                  min="0"
                  value={balls}
                  onChange={e => setBalls(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Paddle Rate (₱)</label>
                <input
                  type="number"
                  value={paddleRate}
                  onChange={e => setPaddleRate(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Ball Rate (₱)</label>
                <input
                  type="number"
                  value={ballRate}
                  onChange={e => setBallRate(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Expected Return Time</label>
              <input
                type="time"
                value={returnTime}
                onChange={e => setReturnTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Rental Total:</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>
                ₱{totalAmount.toLocaleString()}
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }}>
              <Plus size={16} /> Record Equipment Rental
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                📋 Equipment Rentals
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                {filtered.length} equipment items
              </p>
            </div>

            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search customer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Items</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Return Time</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No equipment rentals recorded.
                    </td>
                  </tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.customer}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.contact_number}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        🏸 {r.paddles} paddles · 🟡 {r.balls} balls
                      </td>
                      <td style={{ padding: '12px' }}>
                        {r.return_time}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 800 }}>
                        ₱{r.amount}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${r.status === 'Rented' ? 'badge-orange' : 'badge-green'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          {r.status === 'Rented' && (
                            <button
                              onClick={() => returnPaddleRental(r.id)}
                              className="btn btn-sm btn-primary"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                            >
                              <RotateCcw size={12} /> Return
                            </button>
                          )}
                          <button
                            onClick={() => deletePaddleRental(r.id)}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '4px 8px', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
