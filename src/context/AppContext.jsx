import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'pickleball_system_v2_data';
const SYNC_CHANNEL_NAME = 'pickleball_sync_channel';

// Initial Mock Data
const INITIAL_PLAYERS = [
  { id: 1, name: 'Prince Miguel', playerType: 'Beginner', registeredAt: '1:00 PM', courtNumber: '2', gamesPlayed: 2, expired: false },
  { id: 2, name: 'Sarah Jenkins', playerType: 'Beginner', registeredAt: '1:05 PM', courtNumber: '2', gamesPlayed: 1, expired: false },
  { id: 3, name: 'David Chen', playerType: 'Novice', registeredAt: '1:10 PM', courtNumber: '1', gamesPlayed: 3, expired: false },
  { id: 4, name: 'Maria Santos', playerType: 'Novice', registeredAt: '1:15 PM', courtNumber: '1', gamesPlayed: 2, expired: false },
  { id: 5, name: 'John Doe', playerType: 'Beginner', registeredAt: '1:20 PM', courtNumber: null, gamesPlayed: 0, expired: false },
  { id: 6, name: 'Elena Cruz', playerType: 'Beginner', registeredAt: '1:22 PM', courtNumber: null, gamesPlayed: 0, expired: false },
  { id: 7, name: 'Carlos Ramos', playerType: 'Novice', registeredAt: '1:25 PM', courtNumber: null, gamesPlayed: 1, expired: false },
  { id: 8, name: 'Hannah Lee', playerType: 'Beginner', registeredAt: '1:30 PM', courtNumber: null, gamesPlayed: 0, expired: false },
];

const INITIAL_COURTS = [
  { courtNumber: '1', players: [3, 4], startedAt: Date.now() - 300000, pausedAt: null },
  { courtNumber: '2', players: [1, 2], startedAt: Date.now() - 450000, pausedAt: null },
  { courtNumber: '3', players: [], startedAt: null, pausedAt: null },
];

const INITIAL_QUEUE = [
  { id: 101, queue_number: 1, player_id: 5, playerName: 'John Doe', playerType: 'Beginner', position_in_queue: 1 },
  { id: 102, queue_number: 1, player_id: 6, playerName: 'Elena Cruz', playerType: 'Beginner', position_in_queue: 2 },
  { id: 103, queue_number: 2, player_id: 7, playerName: 'Carlos Ramos', playerType: 'Novice', position_in_queue: 1 },
  { id: 104, queue_number: 2, player_id: 8, playerName: 'Hannah Lee', playerType: 'Beginner', position_in_queue: 2 },
];

const INITIAL_TIMERS = {
  1: { remaining: 12500, running: true, expired: false },
  2: { remaining: 11200, running: true, expired: false },
  3: { remaining: 10800, running: true, expired: false },
  4: { remaining: 9400, running: true, expired: false },
  5: { remaining: 14000, running: true, expired: false },
  6: { remaining: 13900, running: true, expired: false },
  7: { remaining: 13500, running: true, expired: false },
  8: { remaining: 14400, running: true, expired: false },
};

const INITIAL_RENTALS = [
  {
    id: 1,
    customer: 'Michael Reyes',
    contact_number: '+63 917 123 4567',
    person_count: 4,
    hourly_rate: 350,
    person_rate: 0,
    court: 'Court 1',
    rental_date: new Date().toISOString().slice(0, 10),
    start_time: '14:00',
    duration: 2,
    amount: 700,
    status: 'Booked',
  },
  {
    id: 2,
    customer: 'Anna Bautista',
    contact_number: '+63 920 987 6543',
    person_count: 6,
    hourly_rate: 400,
    person_rate: 50,
    court: 'Court 3',
    rental_date: new Date().toISOString().slice(0, 10),
    start_time: '16:00',
    duration: 1,
    amount: 700,
    status: 'Ongoing',
  },
];

const INITIAL_PADDLES = [
  {
    id: 1,
    customer: 'Leo Fernandez',
    contact_number: '+63 918 555 1234',
    paddles: 2,
    balls: 3,
    paddle_rate: 50,
    ball_rate: 20,
    amount: 160,
    return_time: '18:00',
    status: 'Rented',
    created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 2,
    customer: 'Sophia Ramos',
    contact_number: '+63 922 444 8888',
    paddles: 1,
    balls: 1,
    paddle_rate: 50,
    ball_rate: 20,
    amount: 70,
    return_time: '15:30',
    status: 'Returned',
    created_at: '14:00',
  },
];

export const AppProvider = ({ children }) => {
  // Load saved state or use defaults
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse local storage', e);
    }
    return null;
  };

  const initial = loadState();

  const [players, setPlayers] = useState(initial?.players || INITIAL_PLAYERS);
  const [courts, setCourts] = useState(initial?.courts || INITIAL_COURTS);
  const [queue, setQueue] = useState(initial?.queue || INITIAL_QUEUE);
  const [playerTimers, setPlayerTimers] = useState(initial?.playerTimers || INITIAL_TIMERS);
  const [courtRentals, setCourtRentals] = useState(initial?.courtRentals || INITIAL_RENTALS);
  const [paddleRentals, setPaddleRentals] = useState(initial?.paddleRentals || INITIAL_PADDLES);
  const [matchResults, setMatchResults] = useState(initial?.matchResults || []);
  const [logbook, setLogbook] = useState(
    initial?.logbook ||
      INITIAL_PLAYERS.map(p => ({
        id: p.id,
        player_id: p.id,
        player_name: p.name,
        player_type: p.playerType,
        registered_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        expired_at: null,
        amount: 200,
        payment_status: p.id % 2 === 0 ? 'paid' : 'unpaid',
      }))
  );
  const [theme, setTheme] = useState(() => localStorage.getItem('pickleball_theme') || 'dark');
  const [currentUser, setCurrentUser] = useState({
    name: 'Admin',
    role: 'Administrator',
    email: 'admin@pickleball.local',
  });
  const [toasts, setToasts] = useState([]);

  const channelRef = useRef(null);

  // Initialize BroadcastChannel for instant cross-tab sync
  useEffect(() => {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_ALL' && event.data.payload) {
          const p = event.data.payload;
          if (p.players) setPlayers(p.players);
          if (p.courts) setCourts(p.courts);
          if (p.queue) setQueue(p.queue);
          if (p.playerTimers) setPlayerTimers(p.playerTimers);
          if (p.courtRentals) setCourtRentals(p.courtRentals);
          if (p.paddleRentals) setPaddleRentals(p.paddleRentals);
          if (p.logbook) setLogbook(p.logbook);
          if (p.matchResults) setMatchResults(p.matchResults);
        }
      };

      return () => channel.close();
    }
  }, []);

  // Save to localStorage and broadcast whenever state changes
  useEffect(() => {
    const payload = {
      players,
      courts,
      queue,
      playerTimers,
      courtRentals,
      paddleRentals,
      logbook,
      matchResults,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'SYNC_ALL', payload });
      }
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [players, courts, queue, playerTimers, courtRentals, paddleRentals, logbook, matchResults]);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pickleball_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toast System
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // 1-Second Master Ticker for 4-Hour Countdown and Court Round Timers
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Tick Player Timers (4 hours = 14400s)
      setPlayerTimers(prevTimers => {
        let hasChanges = false;
        const next = { ...prevTimers };

        players.forEach(p => {
          const t = next[p.id];
          if (t && t.running && t.remaining > 0) {
            hasChanges = true;
            const newRemaining = Math.max(0, t.remaining - 1);
            const isNowExpired = newRemaining === 0;

            next[p.id] = {
              ...t,
              remaining: newRemaining,
              running: !isNowExpired,
              expired: isNowExpired,
            };

            if (isNowExpired && !p.expired) {
              // Mark player as expired
              handlePlayerExpired(p.id);
            }
          }
        });

        return hasChanges ? next : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [players]);

  // Handle player 4-hour expiration:
  // - Evict from queue
  // - Evict from court
  // - Retain in Registered Players list & Logbook with Expired badge
  const handlePlayerExpired = (playerId) => {
    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, expired: true, courtNumber: null } : p))
    );
    setQueue(prev => prev.filter(q => q.player_id !== playerId));
    setCourts(prev =>
      prev.map(c => ({
        ...c,
        players: c.players.filter(pid => pid !== playerId),
      }))
    );
    setLogbook(prev =>
      prev.map(lb =>
        lb.player_id === playerId && !lb.expired_at
          ? { ...lb, expired_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          : lb
      )
    );
    showToast(`Player time expired for #${playerId}. Retained in roster.`, 'info');
  };

  // -------------------------------------------------------------
  // OPEN PLAY ACTIONS
  // -------------------------------------------------------------

  // Add / Register a Player
  const addPlayer = (name, rawType = 'Beginner', amount = 200, paymentStatus = 'unpaid') => {
    const trimmedName = name.trim();
    if (!trimmedName) return { ok: false, error: 'Name is required' };

    let playerType = rawType === 'Novice' || rawType === 'Newbie' ? 'Novice' : 'Beginner';

    // Duplicate check
    const existingIndex = players.findIndex(
      p => p.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingIndex !== -1) {
      const existing = players[existingIndex];
      const timer = playerTimers[existing.id];
      const isExpired = existing.expired || (timer && timer.remaining <= 0);

      if (!isExpired) {
        return { ok: false, error: `Player "${trimmedName}" is already registered and active.` };
      }

      // Re-register existing expired player
      return reRegisterPlayer(existing.id);
    }

    const newId = (players.length ? Math.max(...players.map(p => p.id)) : 0) + 1;
    const regTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const newPlayer = {
      id: newId,
      name: trimmedName,
      playerType,
      registeredAt: regTime,
      courtNumber: null,
      gamesPlayed: 0,
      expired: false,
    };

    setPlayers(prev => [...prev, newPlayer]);

    // Initialize 4-hour countdown (14400s)
    setPlayerTimers(prev => ({
      ...prev,
      [newId]: {
        remaining: 14400,
        running: true,
        expired: false,
      },
    }));

    // Add to logbook
    setLogbook(prev => [
      {
        id: Date.now(),
        player_id: newId,
        player_name: trimmedName,
        player_type: playerType,
        registered_at: regTime,
        expired_at: null,
        amount: Number(amount) || 0,
        payment_status: paymentStatus,
      },
      ...prev,
    ]);

    showToast(`Added ${trimmedName} (${playerType}) with 4-hour timer!`, 'success');
    return { ok: true, player: newPlayer };
  };

  // Re-register an Expired Player
  const reRegisterPlayer = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return { ok: false, error: 'Player not found' };

    const regTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    setPlayers(prev =>
      prev.map(p =>
        p.id === playerId
          ? { ...p, expired: false, registeredAt: regTime, courtNumber: null }
          : p
      )
    );

    setPlayerTimers(prev => ({
      ...prev,
      [playerId]: {
        remaining: 14400,
        running: true,
        expired: false,
      },
    }));

    setLogbook(prev => [
      {
        id: Date.now(),
        player_id: playerId,
        player_name: player.name,
        player_type: player.playerType,
        registered_at: regTime,
        expired_at: null,
        amount: 200,
        payment_status: 'unpaid',
      },
      ...prev,
    ]);

    showToast(`Re-registered ${player.name} for another 4 hours!`, 'success');
    return { ok: true };
  };

  // Delete a Player
  const deletePlayer = (playerId) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    setQueue(prev => prev.filter(q => q.player_id !== playerId));
    setCourts(prev =>
      prev.map(c => ({
        ...c,
        players: c.players.filter(pid => pid !== playerId),
      }))
    );
    setPlayerTimers(prev => {
      const copy = { ...prev };
      delete copy[playerId];
      return copy;
    });
    showToast(`Player #${playerId} removed.`, 'info');
  };

  // Change Player Skill Level
  const updatePlayerSkill = (playerId, newSkill) => {
    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, playerType: newSkill } : p))
    );
    setQueue(prev =>
      prev.map(q => (q.player_id === playerId ? { ...q, playerType: newSkill } : q))
    );
  };

  // Clear all registered players
  const clearAllPlayers = () => {
    if (!window.confirm('Are you sure you want to clear all players and queues?')) return;
    setPlayers([]);
    setQueue([]);
    setCourts([
      { courtNumber: '1', players: [], startedAt: null, pausedAt: null },
      { courtNumber: '2', players: [], startedAt: null, pausedAt: null },
      { courtNumber: '3', players: [], startedAt: null, pausedAt: null },
    ]);
    setPlayerTimers({});
    showToast('All players and sessions reset.', 'info');
  };

  // Court Timers
  const startCourtTimer = (courtNumber) => {
    setCourts(prev =>
      prev.map(c =>
        c.courtNumber === courtNumber
          ? { ...c, startedAt: Date.now(), pausedAt: null }
          : c
      )
    );
  };

  const pauseCourtTimer = (courtNumber) => {
    setCourts(prev =>
      prev.map(c => {
        if (c.courtNumber === courtNumber) {
          if (c.startedAt && !c.pausedAt) {
            return { ...c, pausedAt: Date.now() };
          } else if (c.pausedAt) {
            // Resume
            const pausedDuration = Date.now() - c.pausedAt;
            return { ...c, startedAt: c.startedAt + pausedDuration, pausedAt: null };
          }
        }
        return c;
      })
    );
  };

  const resetCourtTimer = (courtNumber) => {
    setCourts(prev =>
      prev.map(c =>
        c.courtNumber === courtNumber
          ? { ...c, startedAt: null, pausedAt: null }
          : c
      )
    );
  };

  // Assign Player to Court manually
  const assignCourt = (playerId, courtNumber) => {
    const cNum = String(courtNumber);
    const targetCourt = courts.find(c => c.courtNumber === cNum);
    if (targetCourt && targetCourt.players.length >= 4) {
      showToast(`Court ${cNum} is already full (4/4 players)`, 'error');
      return;
    }

    setCourts(prev =>
      prev.map(c => {
        if (c.courtNumber === cNum) {
          if (!c.players.includes(playerId)) {
            return { ...c, players: [...c.players, playerId] };
          }
        } else {
          return { ...c, players: c.players.filter(id => id !== playerId) };
        }
        return c;
      })
    );

    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, courtNumber: cNum } : p))
    );

    setQueue(prev => prev.filter(q => q.player_id !== playerId));
  };

  // Unassign Player from Court
  const unassignCourt = (playerId) => {
    setCourts(prev =>
      prev.map(c => ({
        ...c,
        players: c.players.filter(id => id !== playerId),
      }))
    );
    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, courtNumber: null } : p))
    );
  };

  // Add Queue Slot
  const addQueueSlot = () => {
    const maxQ = queue.length ? Math.max(...queue.map(q => q.queue_number)) : 0;
    // Just creates a visual placeholder or opens up slot
    showToast(`Queue slot #${maxQ + 1} ready.`, 'info');
  };

  // Add Player to Queue
  const addPlayerToQueue = (playerId, queueNumber = 1) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // Check if player is expired
    if (player.expired || (playerTimers[playerId] && playerTimers[playerId].remaining <= 0)) {
      showToast('Cannot queue an expired player. Please re-register them first.', 'error');
      return;
    }

    // Remove from any court
    unassignCourt(playerId);

    setQueue(prev => {
      const filtered = prev.filter(q => q.player_id !== playerId);
      const existingInQ = filtered.filter(q => q.queue_number === queueNumber);
      if (existingInQ.length >= 4) {
        showToast(`Queue ${queueNumber} is full (4/4)`, 'error');
        return prev;
      }
      return [
        ...filtered,
        {
          id: Date.now() + Math.random(),
          queue_number: queueNumber,
          player_id: playerId,
          playerName: player.name,
          playerType: player.playerType,
          position_in_queue: existingInQ.length + 1,
          gamesPlayed: player.gamesPlayed || 0,
        },
      ];
    });
  };

  // Remove Player from Queue
  const removePlayerFromQueue = (playerId) => {
    setQueue(prev => prev.filter(q => q.player_id !== playerId));
  };

  // Delete an Entire Queue Slot
  const deleteQueueSlot = (queueNumber) => {
    setQueue(prev => {
      const filtered = prev.filter(q => q.queue_number !== queueNumber);
      // Shift down queue numbers
      return filtered.map(q =>
        q.queue_number > queueNumber ? { ...q, queue_number: q.queue_number - 1 } : q
      );
    });
    showToast(`Queue #${queueNumber} cleared.`, 'info');
  };

  // Swap / Reorder Queues (Drag Q1 to Q3, Q2 to Q4)
  const swapQueues = (q1, q2) => {
    if (q1 === q2) return;
    setQueue(prev =>
      prev.map(q => {
        if (q.queue_number === q1) return { ...q, queue_number: q2 };
        if (q.queue_number === q2) return { ...q, queue_number: q1 };
        return q;
      })
    );
    showToast(`Reordered Queue ${q1} ⇄ Queue ${q2}`, 'success');
  };

  // Send Entire Queue to Court
  const sendQueueToCourt = (queueNumber, courtNumber) => {
    const cNum = String(courtNumber);
    const queuePlayers = queue.filter(q => q.queue_number === queueNumber);
    if (!queuePlayers.length) {
      showToast(`Queue ${queueNumber} has no players to send.`, 'error');
      return;
    }

    const pids = queuePlayers.map(q => q.player_id);

    // Evict old players on that court
    setCourts(prev =>
      prev.map(c => {
        if (c.courtNumber === cNum) {
          return {
            ...c,
            players: pids,
            startedAt: Date.now(),
            pausedAt: null,
          };
        }
        return c;
      })
    );

    // Update players' court assignment
    setPlayers(prev =>
      prev.map(p => {
        if (pids.includes(p.id)) return { ...p, courtNumber: cNum };
        if (p.courtNumber === cNum && !pids.includes(p.id)) return { ...p, courtNumber: null };
        return p;
      })
    );

    // Remove this queue and shift higher queues down
    setQueue(prev => {
      const filtered = prev.filter(q => q.queue_number !== queueNumber);
      return filtered.map(q =>
        q.queue_number > queueNumber ? { ...q, queue_number: q.queue_number - 1 } : q
      );
    });

    showToast(`Queue ${queueNumber} sent to Court ${cNum}! 15-min round started.`, 'success');
  };

  // -------------------------------------------------------------
  // MATCH END: AUTOMATIC 2-AND-2 QUEUE SPLITTING & RANDOMIZATION
  // - No modal popup!
  // - Novice vs Novice, Beginner vs Beginner segregation
  // - Fills existing waiting queues first up to 4
  // - Splits remaining 4 players into 2 separate queues (2 & 2)
  // - Increments Games Played
  // -------------------------------------------------------------
  const endMatch = (courtNumber) => {
    const cNum = String(courtNumber);
    const court = courts.find(c => c.courtNumber === cNum);
    if (!court || !court.players.length) {
      showToast(`Court ${cNum} has no active match.`, 'error');
      return;
    }

    const matchPlayers = [...court.players];

    // Reset court
    setCourts(prev =>
      prev.map(c =>
        c.courtNumber === cNum
          ? { ...c, players: [], startedAt: null, pausedAt: null }
          : c
      )
    );

    // Increment gamesPlayed for all participants
    setPlayers(prev =>
      prev.map(p =>
        matchPlayers.includes(p.id)
          ? { ...p, courtNumber: null, gamesPlayed: (p.gamesPlayed || 0) + 1 }
          : p
      )
    );

    // Record Match in History (2 random winners, 2 losers)
    const shuffledForWinner = [...matchPlayers].sort(() => Math.random() - 0.5);
    const winners = shuffledForWinner.slice(0, 2);
    const losers = shuffledForWinner.slice(2);

    const matchRecord = {
      id: Date.now(),
      court: cNum,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      winners,
      losers,
      participants: matchPlayers,
    };
    setMatchResults(prev => [matchRecord, ...prev]);

    // Separate by Skill Level (Beginner vs Novice segregation)
    const novices = matchPlayers.filter(pid => {
      const p = players.find(x => x.id === pid);
      return p && (p.playerType === 'Novice' || p.playerType === 'Newbie');
    });

    const beginners = matchPlayers.filter(pid => {
      const p = players.find(x => x.id === pid);
      return !p || (p.playerType !== 'Novice' && p.playerType !== 'Newbie');
    });

    // Queue allocation with 2-and-2 splitting
    setQueue(prevQueue => {
      let currentQueue = [...prevQueue.filter(q => !matchPlayers.includes(q.player_id))];

      [novices, beginners].forEach(group => {
        if (!group.length) return;

        // Shuffle returning players to randomize pairs
        const shuffledGroup = [...group].sort(() => Math.random() - 0.5);
        let remaining = [...shuffledGroup];

        // 1. Try to fill existing queues of the same skill that have < 4 players
        const skill = group === novices ? 'Novice' : 'Beginner';
        const uniqueQueueNums = [...new Set(currentQueue.map(q => q.queue_number))].sort((a, b) => a - b);

        for (const qn of uniqueQueueNums) {
          const members = currentQueue.filter(q => q.queue_number === qn);
          // Check if queue belongs to this skill
          const isSameSkill = members.every(m => (m.playerType === 'Novice' || m.playerType === 'Newbie') === (skill === 'Novice'));
          if (isSameSkill && members.length < 4 && remaining.length > 0) {
            const availableSpace = 4 - members.length;
            const toAdd = remaining.slice(0, availableSpace);
            remaining = remaining.slice(availableSpace);

            toAdd.forEach((pid, idx) => {
              const p = players.find(x => x.id === pid);
              if (p) {
                currentQueue.push({
                  id: Date.now() + Math.random(),
                  queue_number: qn,
                  player_id: pid,
                  playerName: p.name,
                  playerType: p.playerType,
                  position_in_queue: members.length + idx + 1,
                  gamesPlayed: (p.gamesPlayed || 0) + 1,
                });
              }
            });
          }
        }

        // 2. If players still remain (e.g. all 4 or 2 remaining), split them 2-and-2 into separate queues!
        if (remaining.length > 0) {
          let nextQueueNumber = currentQueue.length
            ? Math.max(...currentQueue.map(q => q.queue_number)) + 1
            : 1;

          // Split into pairs of 2
          for (let i = 0; i < remaining.length; i += 2) {
            const pair = remaining.slice(i, i + 2);
            pair.forEach((pid, posIdx) => {
              const p = players.find(x => x.id === pid);
              if (p) {
                currentQueue.push({
                  id: Date.now() + Math.random(),
                  queue_number: nextQueueNumber,
                  player_id: pid,
                  playerName: p.name,
                  playerType: p.playerType,
                  position_in_queue: posIdx + 1,
                  gamesPlayed: (p.gamesPlayed || 0) + 1,
                });
              }
            });
            nextQueueNumber += 1;
          }
        }
      });

      return currentQueue;
    });

    showToast(`Match on Court ${cNum} ended! Players split 2-and-2 & queued automatically.`, 'success');
  };

  // -------------------------------------------------------------
  // RENTALS ACTIONS
  // -------------------------------------------------------------

  const addCourtRental = (rental) => {
    const newId = courtRentals.length ? Math.max(...courtRentals.map(r => r.id)) + 1 : 1;
    const dur = Number(rental.duration || 1);
    const rate = Number(rental.hourly_rate || 0);
    const persons = Number(rental.person_count || 1);
    const personRate = Number(rental.person_rate || 0);
    const totalAmount = dur * rate + persons * personRate;

    const newBooking = {
      ...rental,
      id: newId,
      amount: totalAmount,
      status: rental.status || 'Booked',
    };

    setCourtRentals(prev => [newBooking, ...prev]);
    showToast(`Court rental booked for ${newBooking.customer}!`, 'success');
  };

  const updateCourtRentalStatus = (id, newStatus) => {
    setCourtRentals(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
    );
    showToast(`Booking #${id} updated to ${newStatus}.`, 'info');
  };

  const deleteCourtRental = (id) => {
    setCourtRentals(prev => prev.filter(r => r.id !== id));
    showToast(`Booking #${id} deleted.`, 'info');
  };

  const addPaddleRental = (rental) => {
    const newId = paddleRentals.length ? Math.max(...paddleRentals.map(r => r.id)) + 1 : 1;
    const paddles = Number(rental.paddles || 0);
    const balls = Number(rental.balls || 0);
    const pRate = Number(rental.paddle_rate || 50);
    const bRate = Number(rental.ball_rate || 20);
    const amount = paddles * pRate + balls * bRate;

    const newR = {
      ...rental,
      id: newId,
      amount,
      status: 'Rented',
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setPaddleRentals(prev => [newR, ...prev]);
    showToast(`Rented equipment for ${newR.customer}!`, 'success');
  };

  const returnPaddleRental = (id) => {
    setPaddleRentals(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'Returned', returned_at: 'Just now' } : r))
    );
    showToast(`Paddle rental #${id} marked as returned.`, 'success');
  };

  const deletePaddleRental = (id) => {
    setPaddleRentals(prev => prev.filter(r => r.id !== id));
    showToast(`Rental #${id} deleted.`, 'info');
  };

  const updatePaymentStatus = (id, status, amount) => {
    setLogbook(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              payment_status: status !== undefined ? status : item.payment_status,
              amount: amount !== undefined ? Number(amount) : item.amount,
            }
          : item
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        players,
        courts,
        queue,
        playerTimers,
        courtRentals,
        paddleRentals,
        matchResults,
        logbook,
        theme,
        toggleTheme,
        currentUser,
        toasts,
        showToast,

        // Open Play
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

        // Rentals
        addCourtRental,
        updateCourtRentalStatus,
        deleteCourtRental,
        addPaddleRental,
        returnPaddleRental,
        deletePaddleRental,
        updatePaymentStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
