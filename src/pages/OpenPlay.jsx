import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Clock,
  Timer,
  ShieldAlert,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Tv,
  CheckCircle,
  Download,
  Printer,
  GripVertical,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';

export const OpenPlay = ({ onOpenLiveDisplay }) => {
  const {
    players,
    courts,
    queue,
    playerTimers,
    addPlayer,
    reRegisterPlayer,
    deletePlayer,
    updatePlayerSkill,
    clearAllPlayers,
    startCourtTimer,
    pauseCourtTimer,
    resetCourtTimer,
    assignCourt,
    unassignCourt,
    addQueueSlot,
    addPlayerToQueue,
    removePlayerFromQueue,
    deleteQueueSlot,
    swapQueues,
    sendQueueToCourt,
    endMatch,
    showToast,
  } = useApp();

  const [inputName, setInputName] = useState('');
  const [inputSkill, setInputSkill] = useState('Beginner');
  const [searchFilter, setSearchFilter] = useState('');
  const [draggedQueue, setDraggedQueue] = useState(null);
  const [dragOverQueue, setDragOverQueue] = useState(null);

  // Format seconds into HH:MM:SS
  const formatTimer = (seconds) => {
    if (seconds <= 0 || isNaN(seconds)) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Format Court Round Timer (15 mins = 900s)
  const getCourtTimeLeft = (court) => {
    if (!court.startedAt) return '15:00';
    let elapsed = 0;
    if (court.pausedAt) {
      elapsed = Math.floor((court.pausedAt - court.startedAt) / 1000);
    } else {
      elapsed = Math.floor((Date.now() - court.startedAt) / 1000);
    }
    const remaining = Math.max(0, 900 - elapsed);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAddSubmit = (e) => {
    e?.preventDefault();
    if (!inputName.trim()) return;
    const res = addPlayer(inputName, inputSkill);
    if (res.ok) {
      setInputName('');
    } else {
      showToast(res.error, 'error');
    }
  };

  // Drag and Drop for Queue Cards
  const handleDragStart = (e, qNum) => {
    setDraggedQueue(qNum);
    e.dataTransfer.setData('text/plain', String(qNum));
  };

  const handleDragOver = (e, qNum) => {
    e.preventDefault();
    if (draggedQueue !== qNum) {
      setDragOverQueue(qNum);
    }
  };

  const handleDrop = (e, targetQNum) => {
    e.preventDefault();
    if (draggedQueue && draggedQueue !== targetQNum) {
      swapQueues(draggedQueue, targetQNum);
    }
    setDraggedQueue(null);
    setDragOverQueue(null);
  };

  // Unique queue numbers currently present
  const queueNumbers = Array.from(new Set(queue.map(q => q.queue_number))).sort((a, b) => a - b);
  // Ensure at least 2 queue slots are shown
  const displayQueueSlots = queueNumbers.length > 0 ? queueNumbers : [1, 2];

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'ID,Name,Skill,Games Played,Registered At,Status,Time Remaining\n';
    players.forEach(p => {
      const t = playerTimers[p.id];
      const timeStr = formatTimer(t?.remaining || 0);
      const status = p.expired ? 'Expired' : (p.courtNumber ? `Court ${p.courtNumber}` : 'Active');
      csv += `"${p.id}","${p.name}","${p.playerType}","${p.gamesPlayed || 0}","${p.registeredAt}","${status}","${timeStr}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pickleball-players-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Filter players
  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase())
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
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 0.5 }}>
              Registered Players
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              {players.length}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              {players.filter(p => !p.expired).length} active · {players.filter(p => p.expired).length} expired
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
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 0.5 }}>
              Session Duration
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              4 hours
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Continuous countdown
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #64748b, #475569)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Timer size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 0.5 }}>
              Play Round
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              15 mins
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Per court match
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tv size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 0.5 }}>
              Active Courts
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              3
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Fixed Courts 1, 2, 3
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 420px) 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Register Players */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={18} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Register Players
              </h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Add players to open play. 4-hour countdown starts immediately.
            </p>
          </div>

          {/* Add Player Input Form */}
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Enter player name..."
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-main)',
                fontSize: 13.5,
                outline: 'none',
              }}
            />
            <select
              value={inputSkill}
              onChange={e => setInputSkill(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-main)',
                fontSize: 13,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="Beginner">🔵 Beginner</option>
              <option value="Novice">🟠 Novice</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
              <Plus size={16} /> Add
            </button>
          </form>

          {/* Search box for player table */}
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search registered players..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-main)',
                fontSize: 12.5,
                outline: 'none',
              }}
            />
          </div>

          {/* Registered Players Table */}
          <div
            style={{
              maxHeight: 460,
              overflowY: 'auto',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', width: 36 }}>#</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Player</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: 55 }}>Games</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Time Left</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', width: 80 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No players found. Add someone above!
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((p, idx) => {
                    const timer = playerTimers[p.id];
                    const isExpired = p.expired || (timer && timer.remaining <= 0);
                    const isAssigned = !!p.courtNumber;

                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: '1px solid var(--border-light)',
                          background: isExpired ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {p.name}
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                            <span
                              onClick={() => updatePlayerSkill(p.id, p.playerType === 'Novice' ? 'Beginner' : 'Novice')}
                              title="Click to toggle skill"
                              className={`badge ${p.playerType === 'Novice' ? 'badge-orange' : 'badge-blue'}`}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              {p.playerType === 'Novice' ? '🟠 Novice' : '🔵 Beginner'}
                            </span>
                            {isAssigned && (
                              <span className="badge badge-green">
                                Court {p.courtNumber}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: 'var(--bg-surface-elevated)',
                              fontWeight: 800,
                              fontSize: 12,
                              color: 'var(--text-main)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            {p.gamesPlayed || 0}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {isExpired ? (
                            <span className="badge badge-red" style={{ fontWeight: 800 }}>
                              Expired
                            </span>
                          ) : (
                            <div>
                              <div
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700,
                                  fontSize: 11.5,
                                  color: 'var(--accent)',
                                }}
                              >
                                {formatTimer(timer?.remaining || 0)}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                Reg {p.registeredAt}
                              </div>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            {isExpired && (
                              <button
                                onClick={() => reRegisterPlayer(p.id)}
                                title="Re-Register (+4 hrs)"
                                className="btn btn-sm btn-primary"
                                style={{ padding: '4px 8px', fontSize: 11 }}
                              >
                                <RefreshCw size={12} /> Re-Reg
                              </button>
                            )}
                            <button
                              onClick={() => deletePlayer(p.id)}
                              title="Remove player"
                              className="btn btn-sm btn-secondary"
                              style={{ padding: '4px 7px', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer stats & actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 8,
              borderTop: '1px solid var(--border)',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Total: <strong style={{ color: 'var(--accent)' }}>{players.length}</strong> players
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={handleExportCSV} className="btn btn-sm btn-secondary">
                <Download size={13} /> Export
              </button>
              <button onClick={clearAllPlayers} className="btn btn-sm btn-danger" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                <Trash2 size={13} /> Clear All
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Court Assignment (Top) & Paddle Stacking (Bottom) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 1. Court Assignment */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'var(--blue-light)',
                      color: 'var(--blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Tv size={18} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Court Assignment
                  </h3>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  🟠 Novices · 🔵 Beginners. 15-min round timers. Click "End Match" to auto-split 2-and-2 & increment games.
                </p>
              </div>
            </div>

            {/* Courts Grid (1, 2, 3) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 16,
              }}
            >
              {courts.map(court => {
                const isPlaying = court.players.length > 0;
                const courtPlayerObjs = court.players
                  .map(pid => players.find(p => p.id === pid))
                  .filter(Boolean);

                return (
                  <div
                    key={court.courtNumber}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: isPlaying ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      boxShadow: isPlaying ? '0 4px 14px rgba(34,197,94,0.15)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Court Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: isPlaying ? 'var(--accent)' : 'var(--text-muted)',
                            boxShadow: isPlaying ? '0 0 8px var(--accent)' : 'none',
                          }}
                        />
                        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                          Court {court.courtNumber}
                        </span>
                      </div>
                      <span className={`badge ${isPlaying ? 'badge-green' : 'badge-gray'}`}>
                        {isPlaying ? `${court.players.length}/4 In Game` : 'Available'}
                      </span>
                    </div>

                    {/* Timer Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--bg-surface)',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Timer size={15} color="var(--accent)" />
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 16,
                            fontWeight: 800,
                            color: 'var(--accent)',
                          }}
                        >
                          {getCourtTimeLeft(court)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => {
                            if (court.startedAt && !court.pausedAt) {
                              pauseCourtTimer(court.courtNumber);
                            } else {
                              startCourtTimer(court.courtNumber);
                            }
                          }}
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '4px 8px' }}
                          title={court.startedAt && !court.pausedAt ? 'Pause' : 'Start'}
                        >
                          {court.startedAt && !court.pausedAt ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                        <button
                          onClick={() => resetCourtTimer(court.courtNumber)}
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '4px 8px' }}
                          title="Reset round"
                        >
                          <RotateCcw size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Player Chips */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 120 }}>
                      {courtPlayerObjs.length === 0 ? (
                        <div
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            color: 'var(--text-muted)',
                            border: '1px dashed var(--border)',
                            borderRadius: 10,
                            padding: 16,
                          }}
                        >
                          Empty court · Send a queue here!
                        </div>
                      ) : (
                        courtPlayerObjs.map(p => (
                          <div
                            key={p.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              background: 'var(--bg-surface)',
                              borderRadius: 8,
                              border: '1px solid var(--border)',
                              fontSize: 12.5,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: '50%',
                                  background: p.playerType === 'Novice' ? '#f59e0b' : '#3b82f6',
                                }}
                              />
                              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                {p.name}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>
                                {p.gamesPlayed || 0} gms
                              </span>
                              <button
                                onClick={() => unassignCourt(p.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: 2,
                                }}
                                title="Unassign"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Action Button: End Match (Auto 2-and-2 split with NO popup) */}
                    <button
                      disabled={!isPlaying}
                      onClick={() => endMatch(court.courtNumber)}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        fontSize: 13,
                        fontWeight: 700,
                        padding: '10px 14px',
                      }}
                    >
                      <CheckCircle size={15} /> End Match
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Paddle Stacking (Queues) */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'var(--orange-light)',
                      color: 'var(--orange)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GripVertical size={18} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Paddle Stacking (Queues)
                  </h3>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  Drag cards to reorder stacks (e.g. Q1 ⇄ Q3). Click Send to Court to seat players immediately.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={addQueueSlot} className="btn btn-secondary btn-sm">
                  <Plus size={14} /> Add Queue Slot
                </button>
                <button onClick={onOpenLiveDisplay} className="btn btn-blue btn-sm">
                  <Tv size={14} /> Public Display View ↗
                </button>
              </div>
            </div>

            {/* Queue Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {displayQueueSlots.map(qNum => {
                const itemsInQueue = queue.filter(q => q.queue_number === qNum);
                const isOver = dragOverQueue === qNum;

                return (
                  <div
                    key={qNum}
                    draggable
                    onDragStart={e => handleDragStart(e, qNum)}
                    onDragOver={e => handleDragOver(e, qNum)}
                    onDrop={e => handleDrop(e, qNum)}
                    onDragEnd={() => {
                      setDraggedQueue(null);
                      setDragOverQueue(null);
                    }}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: isOver ? '2px dashed var(--accent)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      cursor: 'grab',
                      transform: isOver ? 'scale(1.02)' : 'none',
                      transition: 'all 0.16s ease',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {/* Queue Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <GripVertical size={16} color="var(--text-muted)" style={{ cursor: 'grab' }} />
                        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                          Queue {qNum}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={`badge ${itemsInQueue.length === 4 ? 'badge-green' : 'badge-gray'}`}>
                          {itemsInQueue.length}/4
                        </span>
                        {itemsInQueue.length > 0 && (
                          <button
                            onClick={() => deleteQueueSlot(qNum)}
                            title="Clear Queue"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--red)',
                              cursor: 'pointer',
                              padding: 2,
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Queued Players List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 110 }}>
                      {itemsInQueue.length === 0 ? (
                        <div
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            color: 'var(--text-muted)',
                            border: '1px dashed var(--border)',
                            borderRadius: 8,
                            padding: 16,
                          }}
                        >
                          Queue empty · Drag or add players
                        </div>
                      ) : (
                        itemsInQueue.map(item => {
                          const isNovice = item.playerType === 'Novice' || item.playerType === 'Newbie';
                          return (
                            <div
                              key={item.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 10px',
                                background: 'var(--bg-surface)',
                                borderRadius: 8,
                                border: '1px solid var(--border)',
                                fontSize: 12.5,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span
                                  className={`badge ${isNovice ? 'badge-orange' : 'badge-blue'}`}
                                  style={{ padding: '2px 6px', fontSize: 10 }}
                                >
                                  {isNovice ? 'Novice' : 'Beginner'}
                                </span>
                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                  {item.playerName}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>
                                  {item.gamesPlayed || 0} gms
                                </span>
                                <button
                                  onClick={() => removePlayerFromQueue(item.player_id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: 2,
                                  }}
                                  title="Remove from queue"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Send to Court Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Send Queue To:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        {['1', '2', '3'].map(cNum => (
                          <button
                            key={cNum}
                            disabled={!itemsInQueue.length}
                            onClick={() => sendQueueToCourt(qNum, cNum)}
                            className="btn btn-sm btn-secondary"
                            style={{
                              padding: '6px 8px',
                              fontSize: 11.5,
                              fontWeight: 700,
                              borderColor: 'var(--border)',
                            }}
                          >
                            Court {cNum}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
