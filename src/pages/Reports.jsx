import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Download, Printer, DollarSign, Users, Calendar, Layers } from 'lucide-react';

export const Reports = () => {
  const { logbook, matchResults, courtRentals, paddleRentals, updatePaymentStatus } = useApp();

  const [activeTab, setActiveTab] = useState('logbook'); // 'logbook' | 'matches' | 'revenue'

  const totalOpenPlayRevenue = logbook
    .filter(l => l.payment_status === 'paid')
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

  const totalCourtRevenue = courtRentals.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalPaddleRevenue = paddleRentals.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const grandTotal = totalOpenPlayRevenue + totalCourtRevenue + totalPaddleRevenue;

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
            💰
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Revenue
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              ₱{grandTotal.toLocaleString()}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Open play + rentals
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
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Open Play Logbook
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              {logbook.length}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Total registered entries
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
            🏆
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Completed Matches
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              {matchResults.length}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Across courts 1 - 3
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          <button
            onClick={() => setActiveTab('logbook')}
            className={`btn btn-sm ${activeTab === 'logbook' ? 'btn-primary' : 'btn-secondary'}`}
          >
            👥 Registration Logbook ({logbook.length})
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`btn btn-sm ${activeTab === 'matches' ? 'btn-primary' : 'btn-secondary'}`}
          >
            🏆 Match History ({matchResults.length})
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`btn btn-sm ${activeTab === 'revenue' ? 'btn-primary' : 'btn-secondary'}`}
          >
            📊 Revenue Breakdown
          </button>
        </div>

        {/* Tab 1: Logbook */}
        {activeTab === 'logbook' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Player Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Skill</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Registered At</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Expired At</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Fee</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {logbook.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No registration logbook entries yet.
                    </td>
                  </tr>
                ) : (
                  logbook.map((entry, idx) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {entry.player_name}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className={`badge ${entry.player_type === 'Novice' ? 'badge-orange' : 'badge-blue'}`}>
                          {entry.player_type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>{entry.registered_at}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {entry.expired_at ? (
                          <span className="badge badge-red">{entry.expired_at}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Active</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 800 }}>
                        ₱{entry.amount || 200}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <select
                          value={entry.payment_status}
                          onChange={e => updatePaymentStatus(entry.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 700,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-surface-elevated)',
                            color: entry.payment_status === 'paid' ? 'var(--accent)' : 'var(--red)',
                            outline: 'none',
                          }}
                        >
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Match History */}
        {activeTab === 'matches' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Match Time</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Court</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Winners</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Participants</th>
                </tr>
              </thead>
              <tbody>
                {matchResults.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No matches ended yet. End a match on Court 1, 2, or 3 to record results!
                    </td>
                  </tr>
                ) : (
                  matchResults.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{m.date}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--accent)' }}>
                        Court {m.court}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge badge-green">
                          IDs: {m.winners?.join(', ')}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {m.participants?.join(', ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Revenue Breakdown */}
        {activeTab === 'revenue' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: 18,
                borderRadius: 14,
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Open Play Registration Fees</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', margin: '6px 0' }}>
                ₱{totalOpenPlayRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                {logbook.filter(l => l.payment_status === 'paid').length} paid players
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: 18,
                borderRadius: 14,
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Court Bookings</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue)', margin: '6px 0' }}>
                ₱{totalCourtRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                {courtRentals.length} bookings
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: 18,
                borderRadius: 14,
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Paddle &amp; Ball Rentals</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--orange)', margin: '6px 0' }}>
                ₱{totalPaddleRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                {paddleRentals.length} rentals
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
