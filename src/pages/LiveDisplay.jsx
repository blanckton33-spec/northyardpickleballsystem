import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Tv,
  Clock,
  Timer,
  Search,
  CheckCircle,
  AlertCircle,
  Shield,
  ArrowLeft,
  Volume2,
  Users
} from 'lucide-react';

export const LiveDisplay = ({ onBackToAdmin }) => {
  const { players, courts, queue, playerTimers } = useApp();

  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  // Clock ticker
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Format seconds into HH:MM:SS
  const formatTimer = (seconds) => {
    if (seconds <= 0 || isNaN(seconds)) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Format court round timer
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

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const selectedTimer = selectedPlayerId ? playerTimers[selectedPlayerId] : null;

  // Filter players for search dropdown without flickering
  const matchingPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine selected player status
  const getPlayerStatus = (player) => {
    if (!player) return null;
    const timer = playerTimers[player.id];
    if (player.expired || (timer && timer.remaining <= 0)) {
      return { type: 'expired', label: 'Time Expired (4h ended)', sub: 'Please visit front desk to re-register' };
    }
    if (player.courtNumber) {
      return { type: 'playing', label: `Playing on Court ${player.courtNumber}`, sub: 'Match in progress' };
    }
    const qItem = queue.find(q => q.player_id === player.id);
    if (qItem) {
      return { type: 'queue', label: `In Queue #${qItem.queue_number}`, sub: `Position ${qItem.position_in_queue} of 4` };
    }
    return { type: 'waiting', label: 'Waiting for Queue', sub: 'Ready to be assigned' };
  };

  const pStatus = getPlayerStatus(selectedPlayer);

  // Unique queues
  const queueNumbers = Array.from(new Set(queue.map(q => q.queue_number))).sort((a, b) => a - b);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 15% 10%, rgba(34,197,94,0.15), transparent 45%), radial-gradient(circle at 85% 90%, rgba(59,130,246,0.12), transparent 45%), #071b15',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: '24px 28px 60px',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Top Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 20,
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                className="btn btn-secondary btn-sm"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <ArrowLeft size={14} /> Back to Admin
              </button>
            )}
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                overflow: 'hidden',
                background: '#ffffff',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
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
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1.2, margin: 0 }}>
                NORTH YARD OPEN PLAY
              </h1>
              <p style={{ fontSize: 10.5, opacity: 0.65, letterSpacing: 3, margin: '2px 0 0', fontWeight: 600 }}>
                LIVE COURT &amp; QUEUE DISPLAY
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Live Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(34,197,94,0.16)',
                border: '1px solid rgba(34,197,94,0.4)',
                fontSize: 12,
                fontWeight: 800,
                color: '#4ade80',
              }}
            >
              <div
                className="live-pulse"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: '#4ade80',
                }}
              />
              <span>LIVE</span>
            </div>

            {/* Live Clock */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 18,
                fontWeight: 800,
                color: '#ffffff',
                background: 'rgba(255,255,255,0.06)',
                padding: '6px 14px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </header>

        {/* Player Name Search & Personal Status (Mobile-Friendly & Smooth) */}
        <section
          style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.12)',
            padding: 22,
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>
                📱 Check Your Status &amp; Time
              </h2>
              <p style={{ fontSize: 12.5, opacity: 0.7, margin: '2px 0 0' }}>
                Type your name below to view your personal 4-hour countdown and court/queue position.
              </p>
            </div>

            {/* Smooth Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  padding: '8px 14px',
                  gap: 10,
                }}
              >
                <Search size={16} color="#4ade80" />
                <input
                  type="text"
                  placeholder="Select or search your name..."
                  value={searchQuery}
                  onFocus={() => setDropdownOpen(true)}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setDropdownOpen(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: 13.5,
                    width: '100%',
                  }}
                />
                {selectedPlayerId && (
                  <button
                    onClick={() => {
                      setSelectedPlayerId(null);
                      setSearchQuery('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      fontSize: 16,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Dropdown with instant filtering */}
              {dropdownOpen && (
                <div
                  className="animate-pop"
                  style={{
                    position: 'absolute',
                    top: 50,
                    left: 0,
                    width: '100%',
                    maxHeight: 250,
                    overflowY: 'auto',
                    background: '#0e2b20',
                    border: '1px solid rgba(34,197,94,0.4)',
                    borderRadius: 14,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                    zIndex: 200,
                    padding: 6,
                  }}
                >
                  {matchingPlayers.length === 0 ? (
                    <div style={{ padding: 12, textAlign: 'center', fontSize: 12, opacity: 0.6 }}>
                      No player found matching "{searchQuery}"
                    </div>
                  ) : (
                    matchingPlayers.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPlayerId(p.id);
                          setSearchQuery(p.name);
                          setDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          transition: 'background 0.12s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700 }}>{p.name}</span>
                          <span
                            style={{
                              fontSize: 10,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: p.playerType === 'Novice' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)',
                              color: p.playerType === 'Novice' ? '#fbbf24' : '#60a5fa',
                              fontWeight: 700,
                            }}
                          >
                            {p.playerType}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, opacity: 0.6 }}>
                          {p.gamesPlayed || 0} games
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Player Banner */}
          {selectedPlayer && pStatus && (
            <div
              className="animate-slide"
              style={{
                background:
                  pStatus.type === 'playing'
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.08))'
                    : pStatus.type === 'expired'
                    ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))'
                    : 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(59,130,246,0.08))',
                border:
                  pStatus.type === 'playing'
                    ? '1.5px solid rgba(34,197,94,0.5)'
                    : pStatus.type === 'expired'
                    ? '1.5px solid rgba(239,68,68,0.5)'
                    : '1.5px solid rgba(59,130,246,0.5)',
                borderRadius: 16,
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
                    {selectedPlayer.name}
                  </h3>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: selectedPlayer.playerType === 'Novice' ? '#f59e0b' : '#3b82f6',
                      color: '#fff',
                    }}
                  >
                    {selectedPlayer.playerType}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.8, fontWeight: 600 }}>
                    🏆 {selectedPlayer.gamesPlayed || 0} Games Played
                  </span>
                </div>
                <div style={{ marginTop: 6, fontSize: 13.5, fontWeight: 700, color: '#86efac' }}>
                  {pStatus.label} · <span style={{ opacity: 0.75, fontWeight: 500 }}>{pStatus.sub}</span>
                </div>
              </div>

              {/* Big 4-hour countdown */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, fontWeight: 700 }}>
                  Personal 4-Hour Time Left
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 28,
                    fontWeight: 800,
                    color: pStatus.type === 'expired' ? '#f87171' : '#4ade80',
                    lineHeight: 1.2,
                  }}
                >
                  {formatTimer(selectedTimer?.remaining || 0)}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Fixed Courts 1, 2, 3 Grid */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Tv size={20} color="#4ade80" />
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              Live Courts (1 - 3)
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 20,
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
                    background: 'rgba(255,255,255,0.06)',
                    border: isPlaying ? '1.5px solid rgba(34,197,94,0.6)' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 18,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    boxShadow: isPlaying ? '0 0 25px rgba(34,197,94,0.18)' : 'none',
                  }}
                >
                  {/* Court Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: isPlaying ? '#4ade80' : 'rgba(255,255,255,0.3)',
                          boxShadow: isPlaying ? '0 0 10px #4ade80' : 'none',
                        }}
                      />
                      <span style={{ fontSize: 18, fontWeight: 800 }}>
                        Court {court.courtNumber}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 18,
                        fontWeight: 800,
                        color: isPlaying ? '#4ade80' : 'rgba(255,255,255,0.4)',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '4px 12px',
                        borderRadius: 8,
                      }}
                    >
                      <Timer size={16} />
                      <span>{getCourtTimeLeft(court)}</span>
                    </div>
                  </div>

                  {/* Players in Court */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 140 }}>
                    {courtPlayerObjs.length === 0 ? (
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          opacity: 0.5,
                          border: '1px dashed rgba(255,255,255,0.15)',
                          borderRadius: 12,
                          padding: 20,
                        }}
                      >
                        Court Available
                      </div>
                    ) : (
                      courtPlayerObjs.map(p => (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: p.playerType === 'Novice' ? '#f59e0b' : '#3b82f6',
                              }}
                            />
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: p.playerType === 'Novice' ? 'rgba(245,158,11,0.25)' : 'rgba(59,130,246,0.25)',
                                color: p.playerType === 'Novice' ? '#fbbf24' : '#60a5fa',
                              }}
                            >
                              {p.playerType}
                            </span>
                            <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>
                              {p.gamesPlayed || 0} gms
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Queue Cards */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={20} color="#60a5fa" />
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              Waiting Queues (Paddle Stacks)
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {queueNumbers.length === 0 ? (
              <div
                style={{
                  gridColumn: '1/-1',
                  background: 'rgba(255,255,255,0.04)',
                  padding: 30,
                  borderRadius: 16,
                  textAlign: 'center',
                  fontSize: 14,
                  opacity: 0.6,
                }}
              >
                No players waiting in queue right now.
              </div>
            ) : (
              queueNumbers.map(qNum => {
                const qItems = queue.filter(q => q.queue_number === qNum);

                return (
                  <div
                    key={qNum}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 15, fontWeight: 800 }}>Queue #{qNum}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: qItems.length === 4 ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)',
                          color: qItems.length === 4 ? '#86efac' : '#ffffff',
                        }}
                      >
                        {qItems.length}/4 Players
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {qItems.map(item => {
                        const isNovice = item.playerType === 'Novice' || item.playerType === 'Newbie';
                        return (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: 'rgba(255,255,255,0.06)',
                              borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.06)',
                              fontSize: 13,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  background: isNovice ? 'rgba(245,158,11,0.25)' : 'rgba(59,130,246,0.25)',
                                  color: isNovice ? '#fbbf24' : '#60a5fa',
                                }}
                              >
                                {isNovice ? 'Novice' : 'Beginner'}
                              </span>
                              <span style={{ fontWeight: 700 }}>{item.playerName}</span>
                            </div>
                            <span style={{ fontSize: 11, opacity: 0.65 }}>
                              {item.gamesPlayed || 0} gms
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
