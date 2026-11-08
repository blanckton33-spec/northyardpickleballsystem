/**
 * North Yard Pickleball - Client-Side Realtime Storage & API Engine
 * Enables 100% fluid, zero-latency execution on Vercel, GitHub Pages, or offline.
 * Intercepts all api/*.php calls and handles state with localStorage & BroadcastChannel.
 */
(function() {
  const SYNC_CHANNEL = 'northyard_pickleball_channel';
  const STORAGE_KEY = 'northyard_pickleball_db_v4';
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(SYNC_CHANNEL) : null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Initial Seed Data
  const defaultDb = {
    currentUser: { id: 1, email: 'admin@pickleball.local', name: 'Admin', role: 'Administrator' },
    session: {
      id: 1,
      started_at: new Date().toISOString(),
      start_time: nowTimeStr,
      status: 'ongoing',
      total_players: 8,
      total_courts: 3,
      notes: 'North Yard Session'
    },
    players: [
      { id: 1, name: 'Prince Miguel', playerType: 'Beginner', registeredAt: '1:00 PM', courtNumber: '2', gamesPlayed: 2, expired: false },
      { id: 2, name: 'Sarah Jenkins', playerType: 'Beginner', registeredAt: '1:05 PM', courtNumber: '2', gamesPlayed: 1, expired: false },
      { id: 3, name: 'David Chen', playerType: 'Newbie', registeredAt: '1:10 PM', courtNumber: '1', gamesPlayed: 3, expired: false },
      { id: 4, name: 'Maria Santos', playerType: 'Newbie', registeredAt: '1:15 PM', courtNumber: '1', gamesPlayed: 2, expired: false },
      { id: 5, name: 'John Doe', playerType: 'Beginner', registeredAt: '1:20 PM', courtNumber: null, gamesPlayed: 0, expired: false },
      { id: 6, name: 'Elena Cruz', playerType: 'Beginner', registeredAt: '1:22 PM', courtNumber: null, gamesPlayed: 0, expired: false },
      { id: 7, name: 'Carlos Ramos', playerType: 'Newbie', registeredAt: '1:25 PM', courtNumber: null, gamesPlayed: 1, expired: false },
      { id: 8, name: 'Hannah Lee', playerType: 'Beginner', registeredAt: '1:30 PM', courtNumber: null, gamesPlayed: 0, expired: false },
    ],
    courtState: [
      { courtNumber: '1', players: [3, 4] },
      { courtNumber: '2', players: [1, 2] },
      { courtNumber: '3', players: [] }
    ],
    courtTimers: {
      '1': { court_number: '1', started_at: new Date(Date.now() - 300000).toISOString(), paused_at: null },
      '2': { court_number: '2', started_at: new Date(Date.now() - 450000).toISOString(), paused_at: null },
      '3': { court_number: '3', started_at: null, paused_at: null }
    },
    queue: [
      { id: 101, session_id: 1, queue_number: 1, player_id: 5, playerName: 'John Doe', playerType: 'Beginner', position_in_queue: 1 },
      { id: 102, session_id: 1, queue_number: 1, player_id: 6, playerName: 'Elena Cruz', playerType: 'Beginner', position_in_queue: 2 },
      { id: 103, session_id: 1, queue_number: 2, player_id: 7, playerName: 'Carlos Ramos', playerType: 'Newbie', position_in_queue: 1 },
      { id: 104, session_id: 1, queue_number: 2, player_id: 8, playerName: 'Hannah Lee', playerType: 'Beginner', position_in_queue: 2 }
    ],
    syncedTimers: {
      1: { player_id: 1, remaining: 12500, roundRemaining: 600, running: true, roundRunning: true, updatedAt: Date.now() },
      2: { player_id: 2, remaining: 11200, roundRemaining: 450, running: true, roundRunning: true, updatedAt: Date.now() },
      3: { player_id: 3, remaining: 10800, roundRemaining: 300, running: true, roundRunning: true, updatedAt: Date.now() },
      4: { player_id: 4, remaining: 9400, roundRemaining: 300, running: true, roundRunning: true, updatedAt: Date.now() },
      5: { player_id: 5, remaining: 14000, roundRemaining: 900, running: true, roundRunning: false, updatedAt: Date.now() },
      6: { player_id: 6, remaining: 13900, roundRemaining: 900, running: true, roundRunning: false, updatedAt: Date.now() },
      7: { player_id: 7, remaining: 13500, roundRemaining: 900, running: true, roundRunning: false, updatedAt: Date.now() },
      8: { player_id: 8, remaining: 14400, roundRemaining: 900, running: true, roundRunning: false, updatedAt: Date.now() }
    },
    matchResults: [],
    logbook: [
      { id: 1, player_id: 1, session_id: 1, player_name: 'Prince Miguel', player_type: 'Beginner', registered_at: todayStr + ' 13:00:00', expired_at: null, amount: 200, payment_status: 'paid' },
      { id: 2, player_id: 2, session_id: 1, player_name: 'Sarah Jenkins', player_type: 'Beginner', registered_at: todayStr + ' 13:05:00', expired_at: null, amount: 200, payment_status: 'paid' },
      { id: 3, player_id: 3, session_id: 1, player_name: 'David Chen', player_type: 'Newbie', registered_at: todayStr + ' 13:10:00', expired_at: null, amount: 200, payment_status: 'unpaid' },
      { id: 4, player_id: 4, session_id: 1, player_name: 'Maria Santos', player_type: 'Newbie', registered_at: todayStr + ' 13:15:00', expired_at: null, amount: 200, payment_status: 'paid' },
      { id: 5, player_id: 5, session_id: 1, player_name: 'John Doe', player_type: 'Beginner', registered_at: todayStr + ' 13:20:00', expired_at: null, amount: 200, payment_status: 'unpaid' },
      { id: 6, player_id: 6, session_id: 1, player_name: 'Elena Cruz', player_type: 'Beginner', registered_at: todayStr + ' 13:22:00', expired_at: null, amount: 200, payment_status: 'paid' },
      { id: 7, player_id: 7, session_id: 1, player_name: 'Carlos Ramos', player_type: 'Newbie', registered_at: todayStr + ' 13:25:00', expired_at: null, amount: 200, payment_status: 'unpaid' },
      { id: 8, player_id: 8, session_id: 1, player_name: 'Hannah Lee', player_type: 'Beginner', registered_at: todayStr + ' 13:30:00', expired_at: null, amount: 200, payment_status: 'paid' },
    ],
    courtRentals: [
      {
        id: 1, customer: 'Michael Reyes', contact_number: '+63 917 123 4567', person_count: 4, hourly_rate: 350, person_rate: 0,
        court: 'Court 1', rental_date: todayStr, start_time: '14:00', duration: 2, amount: 700, status: 'Booked', created_at: todayStr + ' 10:00:00'
      },
      {
        id: 2, customer: 'Anna Bautista', contact_number: '+63 920 987 6543', person_count: 6, hourly_rate: 400, person_rate: 50,
        court: 'Court 3', rental_date: todayStr, start_time: '16:00', duration: 1, amount: 700, status: 'Ongoing', created_at: todayStr + ' 11:30:00'
      }
    ],
    paddleRentals: [
      {
        id: 1, customer: 'Leo Fernandez', contact_number: '+63 918 555 1234', paddles: 2, balls: 3, paddle_rate: 50, ball_rate: 20,
        amount: 160, return_time: '18:00', status: 'Rented', returned_at: null, created_at: todayStr + ' 13:00:00'
      },
      {
        id: 2, customer: 'Sophia Ramos', contact_number: '+63 922 444 8888', paddles: 1, balls: 1, paddle_rate: 50, ball_rate: 20,
        amount: 70, return_time: '15:30', status: 'Returned', returned_at: todayStr + ' 15:25:00', created_at: todayStr + ' 14:00:00'
      }
    ],
    products: [
      { id: 1, name: 'Franklin X-40 Pickleball Balls (3-pack)', sku: 'BALL-FX40-3', category: 'Balls', price: 450, stock: 24, min_stock: 10, unit: 'pack', status: 'Active' },
      { id: 2, name: 'Selkirk Vanguard 2.0 Paddle', sku: 'PAD-SLK-VG2', category: 'Paddles', price: 8500, stock: 6, min_stock: 3, unit: 'pcs', status: 'Active' },
      { id: 3, name: 'North Yard Club Tour Grip', sku: 'ACC-NY-GRP', category: 'Accessories', price: 180, stock: 45, min_stock: 15, unit: 'pcs', status: 'Active' }
    ],
    stockIn: [],
    stockOut: [],
    suppliers: [
      { id: 1, name: 'Pickleball Central PH', contact_person: 'Mark Tan', phone: '+63 917 555 0192', email: 'sales@pickleballcentral.ph', status: 'Active' }
    ],
    users: [
      { id: 1, name: 'Admin', email: 'admin@pickleball.local', role: 'Administrator', status: 'Active', created: '2026-11-01 10:00:00', created_at: '2026-11-01 10:00:00' },
      { id: 2, name: 'Coach Dave', email: 'dave@pickleball.local', role: 'Staff', status: 'Active', created: '2026-11-02 14:30:00', created_at: '2026-11-02 14:30:00' },
      { id: 3, name: 'Court Marshal Sarah', email: 'sarah@pickleball.local', role: 'Staff', status: 'Active', created: '2026-11-03 09:15:00', created_at: '2026-11-03 09:15:00' }
    ]
  };

  function getDb() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.users || !parsed.users.length || parsed.users.length < 2) {
          parsed.users = defaultDb.users;
        }
        if (!parsed.courtState || !parsed.courtState.length) {
          parsed.courtState = defaultDb.courtState;
        }
        if (!parsed.players || !parsed.players.length) {
          parsed.players = defaultDb.players;
        }
        return parsed;
      }
    } catch(e) {}
    return defaultDb;
  }


  function saveDb(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      if (bc) bc.postMessage({ type: 'DB_SYNC', timestamp: Date.now() });
    } catch(e) {}
  }

  function getGamesPlayed(db, playerId) {
    return db.matchResults.filter(m => m.session_id === db.session.id && Number(m.player_id) === Number(playerId)).length;
  }

  // Cross-tab sync listener
  if (bc) {
    bc.onmessage = function(event) {
      if (event.data?.type === 'DB_SYNC') {
        if (typeof opRender === 'function') {
          try {
            api('open_play.php?action=current').then(r => {
              if (r.ok && typeof opInit === 'function') {
                // Background update
              }
            });
          } catch(e) {}
        }
      }
    };
  }

  // Original fetch
  const originalFetch = window.fetch;

  // Intercept fetch
  window.fetch = async function(resource, init = {}) {
    let urlStr = typeof resource === 'string' ? resource : (resource?.url || '');
    
    // Check if this is an API call
    if (urlStr.includes('api/')) {
      const parsedUrl = new URL(urlStr, window.location.href);
      const pathname = parsedUrl.pathname;
      const query = Object.fromEntries(parsedUrl.searchParams.entries());
      const method = (init.method || 'GET').toUpperCase();
      let body = {};
      try {
        if (init.body) {
          body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
        }
      } catch(e) {}

      const db = getDb();

      // ===================================
      // 1. /api/auth.php
      // ===================================
      if (pathname.endsWith('auth.php')) {
        const action = query.action || '';
        if (action === 'me') {
          return new Response(JSON.stringify({ ok: true, user: db.currentUser }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (action === 'login' || action === 'signup') {
          db.currentUser = {
            id: 1,
            email: body.email || 'admin@pickleball.local',
            name: (body.email ? body.email.split('@')[0] : 'Admin'),
            role: 'Administrator'
          };
          saveDb(db);
          return new Response(JSON.stringify({ ok: true, user: db.currentUser }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (action === 'logout') {
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // ===================================
      // 2. /api/open_play.php
      // ===================================
      if (pathname.endsWith('open_play.php')) {
        const action = query.action || '';

        // DELETE / remove_player
        if (method === 'DELETE' || action === 'remove_player') {
          const pid = Number(query.playerId || body.playerId);
          const isExpired = query.expired === '1' || body.expired === true;
          if (pid) {
            const lb = db.logbook.find(x => x.player_id === pid && !x.expired_at);
            if (lb && (isExpired || lb.expired_at === undefined)) {
              lb.expired_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
            }
            db.queue = db.queue.filter(q => q.player_id !== pid);
            db.courtState.forEach(c => {
              c.players = c.players.filter(id => id !== pid);
            });
            const p = db.players.find(x => x.id === pid);
            if (p) p.courtNumber = null;

            if (db.syncedTimers[pid]) {
              db.syncedTimers[pid].remaining = 0;
              db.syncedTimers[pid].running = false;
              db.syncedTimers[pid].roundRunning = false;
            }

            if (isExpired) {
              if (p) p.expired = true;
            } else {
              db.players = db.players.filter(x => x.id !== pid);
              delete db.syncedTimers[pid];
              db.session.total_players = db.players.length;
            }
            saveDb(db);
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // CURRENT
        if (action === 'current') {
          const res = {
            ok: true,
            session: db.session,
            courts: db.courtState.map(c => ({
              courtNumber: String(c.courtNumber),
              players: c.players.map(pid => {
                const p = db.players.find(x => x.id === pid);
                return p ? { id: p.id, name: p.name, playerType: p.playerType, registeredAt: p.registeredAt, gamesPlayed: getGamesPlayed(db, p.id) } : null;
              }).filter(Boolean),
              timer: db.courtTimers[c.courtNumber] || null
            })),
            players: db.players.map(p => ({
              id: p.id,
              name: p.name,
              registeredAt: p.registeredAt,
              courtNumber: p.courtNumber,
              playerType: p.playerType,
              expired: p.expired || false,
              gamesPlayed: getGamesPlayed(db, p.id)
            })),
            queue: db.queue.map(q => ({
              queue_number: q.queue_number,
              position_in_queue: q.position_in_queue,
              player_id: q.player_id,
              playerName: q.playerName,
              playerType: q.playerType,
              lastResult: q.lastResult || null,
              gamesPlayed: getGamesPlayed(db, q.player_id)
            })),
            timers: [1, 2, 3].map(c => ({
              courtNumber: String(c),
              started_at: db.courtTimers[c]?.started_at || null,
              paused_at: db.courtTimers[c]?.paused_at || null
            })),
            timerState: db.players.map(p => {
              const st = db.syncedTimers[p.id];
              if (st) {
                const elapsed = Math.floor((Date.now() - (st.updatedAt || Date.now())) / 1000);
                const roundRemaining = st.roundRunning ? Math.max(0, st.roundRemaining - elapsed) : st.roundRemaining;
                const spent = st.running ? elapsed : 0;
                const remaining = Math.max(0, st.remaining - spent);
                return {
                  player_id: p.id,
                  remaining,
                  roundRemaining,
                  running: st.running && remaining > 0,
                  roundRunning: st.roundRunning && roundRemaining > 0 && remaining > 0
                };
              }
              return { player_id: p.id, remaining: 14400, roundRemaining: 900, running: true, roundRunning: !!p.courtNumber };
            })
          };
          return new Response(JSON.stringify(res), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // GET_DISPLAY_DATA
        if (action === 'get_display_data') {
          const res = {
            ok: true,
            session: db.session,
            courts: db.courtState.map(c => {
              const cNum = String(c.courtNumber);
              const cTimer = db.courtTimers[cNum];
              return {
                courtNumber: cNum,
                startedAt: cTimer?.started_at || null,
                pausedAt: cTimer?.paused_at || null,
                players: c.players.map(pid => {
                  const p = db.players.find(x => x.id === pid);
                  return p ? { id: p.id, name: p.name, playerType: p.playerType, registeredAt: p.registeredAt, courtNumber: p.courtNumber, gamesPlayed: getGamesPlayed(db, p.id) } : null;
                }).filter(Boolean)
              };
            }),
            timers: db.courtTimers,
            players: db.players.map(p => ({
              id: p.id,
              name: p.name,
              courtNumber: p.courtNumber,
              playerType: p.playerType,
              expired: p.expired || false,
              gamesPlayed: getGamesPlayed(db, p.id)
            })),
            queue: db.queue.map(q => ({
              ...q,
              gamesPlayed: getGamesPlayed(db, q.player_id)
            })),
            timerState: db.players.map(p => {
              const st = db.syncedTimers[p.id];
              if (st) {
                const elapsed = Math.floor((Date.now() - (st.updatedAt || Date.now())) / 1000);
                const roundRemaining = st.roundRunning ? Math.max(0, st.roundRemaining - elapsed) : st.roundRemaining;
                const spent = st.running ? elapsed : 0;
                const remaining = Math.max(0, st.remaining - spent);
                return {
                  player_id: p.id,
                  remaining,
                  roundRemaining,
                  running: st.running && remaining > 0,
                  roundRunning: st.roundRunning && roundRemaining > 0 && remaining > 0
                };
              }
              return { player_id: p.id, remaining: 14400, roundRemaining: 900, running: true, roundRunning: !!p.courtNumber };
            })
          };
          return new Response(JSON.stringify(res), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // ADD_PLAYER
        if (action === 'add_player') {
          const name = (body.name || '').trim();
          let rawType = (body.playerType || 'Beginner').trim();
          if (rawType.toLowerCase() === 'novice') rawType = 'Newbie';
          const playerType = ['Newbie', 'Beginner'].includes(rawType) ? rawType : 'Beginner';
          const registeredAt = body.registeredAt || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

          const existingIdx = db.players.findIndex(p => p.name.trim().toLowerCase() === name.toLowerCase());
          if (existingIdx !== -1) {
            const existingPlayer = db.players[existingIdx];
            const timer = db.syncedTimers[existingPlayer.id];
            const isTimerExpired = existingPlayer.expired || (timer && timer.remaining <= 0);
            if (!isTimerExpired) {
              return new Response(JSON.stringify({ ok: false, error: 'Player "' + name + '" is already registered.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
            db.players.splice(existingIdx, 1);
            delete db.syncedTimers[existingPlayer.id];
          }

          const newId = (db.players.length ? Math.max(...db.players.map(p => p.id)) : 0) + 1;
          const newPlayer = { id: newId, name, playerType, registeredAt, courtNumber: null, expired: false };
          db.players.push(newPlayer);
          db.session.total_players = db.players.length;

          db.syncedTimers[newId] = {
            player_id: newId,
            remaining: 14400,
            roundRemaining: 900,
            running: true,
            roundRunning: false,
            updatedAt: Date.now()
          };

          db.logbook.unshift({
            id: Date.now(),
            player_id: newId,
            session_id: db.session.id,
            player_name: name,
            player_type: playerType,
            registered_at: todayStr + ' ' + registeredAt,
            expired_at: null,
            amount: Number(body.amount) || 200,
            payment_status: body.paymentStatus || 'unpaid'
          });

          saveDb(db);
          return new Response(JSON.stringify({ ok: true, playerId: newId, player: newPlayer }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // UPDATE_PLAYER_TYPE
        if (action === 'update_player_type') {
          const pid = Number(body.playerId);
          let rawType = (body.playerType || 'Beginner').trim();
          if (rawType.toLowerCase() === 'novice') rawType = 'Newbie';
          const playerType = ['Newbie', 'Beginner'].includes(rawType) ? rawType : 'Beginner';

          const p = db.players.find(x => x.id === pid);
          if (p) p.playerType = playerType;
          const qItem = db.queue.find(x => x.player_id === pid);
          if (qItem) qItem.playerType = playerType;
          const lb = db.logbook.find(x => x.player_id === pid);
          if (lb) lb.player_type = playerType;

          saveDb(db);
          return new Response(JSON.stringify({ ok: true, playerType }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // ASSIGN_COURT
        if (action === 'assign_court') {
          const pid = Number(body.playerId);
          const courtNum = String(body.courtNumber || '1');
          const c = db.courtState.find(x => x.courtNumber === courtNum);
          if (c && !c.players.includes(pid)) {
            c.players.push(pid);
            const p = db.players.find(x => x.id === pid);
            if (p) p.courtNumber = courtNum;
            db.queue = db.queue.filter(x => x.player_id !== pid);
            saveDb(db);
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // UNASSIGN_COURT
        if (action === 'unassign_court') {
          const pid = Number(body.playerId);
          db.courtState.forEach(c => {
            c.players = c.players.filter(id => id !== pid);
          });
          const p = db.players.find(x => x.id === pid);
          if (p) p.courtNumber = null;
          saveDb(db);
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // ADD_TO_QUEUE
        if (action === 'add_to_queue') {
          const pid = Number(body.playerId);
          const qn = Number(body.queueNumber || 1);
          const p = db.players.find(x => x.id === pid);
          if (p) {
            db.queue = db.queue.filter(x => x.player_id !== pid);
            const currentInQ = db.queue.filter(x => x.queue_number === qn);
            if (currentInQ.length < 4) {
              db.queue.push({
                id: Date.now(),
                session_id: db.session.id,
                queue_number: qn,
                player_id: pid,
                playerName: p.name,
                playerType: p.playerType,
                position_in_queue: currentInQ.length + 1,
                lastResult: null
              });
              saveDb(db);
            }
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // SWAP_QUEUES
        if (action === 'swap_queues') {
          const q1 = Number(body.queue1);
          const q2 = Number(body.queue2);
          if (q1 && q2) {
            db.queue.forEach(q => {
              if (q.queue_number === q1) q.queue_number = -999;
            });
            db.queue.forEach(q => {
              if (q.queue_number === q2) q.queue_number = q1;
            });
            db.queue.forEach(q => {
              if (q.queue_number === -999) q.queue_number = q2;
            });
            saveDb(db);
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // REMOVE_FROM_QUEUE
        if (action === 'remove_from_queue') {
          const pid = Number(body.playerId);
          db.queue = db.queue.filter(x => x.player_id !== pid);
          saveDb(db);
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // DELETE_QUEUE
        if (action === 'delete_queue') {
          const qn = Number(body.queueNumber);
          db.queue = db.queue.filter(x => x.queue_number !== qn);
          db.queue.forEach(q => {
            if (q.queue_number > qn) q.queue_number -= 1;
          });
          saveDb(db);
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // SEND_QUEUE_TO_COURT
        if (action === 'send_queue_to_court') {
          const qn = Number(body.queueNumber);
          const courtNum = String(body.courtNumber);
          const c = db.courtState.find(x => x.courtNumber === courtNum);
          const qItems = db.queue.filter(x => x.queue_number === qn);
          if (c) {
            c.players = qItems.map(q => q.player_id);
            c.players.forEach(pid => {
              const p = db.players.find(x => x.id === pid);
              if (p) p.courtNumber = courtNum;
            });
            db.queue = db.queue.filter(x => x.queue_number !== qn);
            db.queue.forEach(q => {
              if (q.queue_number > qn) q.queue_number -= 1;
            });
            db.courtTimers[courtNum] = { court_number: courtNum, started_at: new Date().toISOString(), paused_at: null };
            saveDb(db);
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // TIMERS (START / PAUSE / RESET)
        if (action === 'start_timer' || action === 'pause_timer' || action === 'reset_timer') {
          const courtNum = String(body.courtNumber || '1');
          if (action === 'start_timer') {
            db.courtTimers[courtNum] = { court_number: courtNum, started_at: new Date().toISOString(), paused_at: null };
          } else if (action === 'pause_timer') {
            db.courtTimers[courtNum] = { court_number: courtNum, started_at: null, paused_at: new Date().toISOString() };
          } else {
            db.courtTimers[courtNum] = { court_number: courtNum, started_at: null, paused_at: null };
          }
          saveDb(db);
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // FINISH_MATCH / RECORD_MATCH_RESULT (AUTOMATIC 2-AND-2 SPLIT)
        if (action === 'record_match_result' || action === 'finish_match') {
          const courtNum = String(body.courtNumber);
          const c = db.courtState.find(x => x.courtNumber === courtNum);
          if (c && c.players.length) {
            const cPlayers = [...c.players];
            c.players = [];
            c.running = false;
            cPlayers.forEach(pid => {
              const p = db.players.find(x => x.id === pid);
              if (p) p.courtNumber = null;
              db.queue = db.queue.filter(x => x.player_id !== pid);
            });

            if (Array.isArray(body.assignments) && body.assignments.length) {
              body.assignments.forEach((a, idx) => {
                const pid = Number(a.playerId);
                const qn = Number(a.queueNumber || 1);
                const resType = a.result || 'played';
                const p = db.players.find(x => x.id === pid);
                if (!p) return;
                if (cPlayers.includes(pid)) {
                  db.matchResults.push({ session_id: db.session.id, court_number: courtNum, player_id: pid, result: resType });
                }
                const currentQ = db.queue.filter(x => x.queue_number === qn);
                if (currentQ.length < 4) {
                  db.queue.push({
                    id: Date.now() + idx,
                    session_id: db.session.id,
                    queue_number: qn,
                    player_id: pid,
                    playerName: p.name,
                    playerType: p.playerType,
                    position_in_queue: currentQ.length + 1,
                    lastResult: resType
                  });
                }
              });
            } else {
              const winners = (body.winners || []).map(Number);
              const novices = cPlayers.filter(pid => {
                const p = db.players.find(x => x.id === pid);
                return p && p.playerType === 'Newbie';
              });
              const beginners = cPlayers.filter(pid => {
                const p = db.players.find(x => x.id === pid);
                return !p || p.playerType !== 'Newbie';
              });

              let nextQ = db.queue.length ? Math.max(...db.queue.map(q => q.queue_number)) + 1 : 1;
              [novices, beginners].forEach(grp => {
                if (!grp.length) return;
                const shuffled = [...grp].sort(() => Math.random() - 0.5);
                shuffled.forEach((pid, idx) => {
                  const p = db.players.find(x => x.id === pid);
                  if (!p) return;
                  const resType = winners.includes(pid) ? 'win' : 'loss';
                  db.matchResults.push({ session_id: db.session.id, court_number: courtNum, player_id: pid, result: resType });
                  const targetQ = nextQ + Math.floor(idx / 2);
                  const currentQ = db.queue.filter(x => x.queue_number === targetQ);
                  db.queue.push({
                    id: Date.now() + idx + Math.random(),
                    session_id: db.session.id,
                    queue_number: targetQ,
                    player_id: pid,
                    playerName: p.name,
                    playerType: p.playerType,
                    position_in_queue: currentQ.length + 1,
                    lastResult: resType
                  });
                });
                nextQ += Math.ceil(grp.length / 2);
              });
            }

            db.courtTimers[courtNum] = { court_number: courtNum, started_at: null, paused_at: null };
            saveDb(db);
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // SYNC_TIMERS
        if (action === 'sync_timers') {
          const pList = body.players || [];
          pList.forEach(p => {
            db.syncedTimers[p.id] = {
              player_id: p.id,
              remaining: Number(p.remaining),
              roundRemaining: Number(p.roundRemaining),
              running: !!p.running,
              roundRunning: !!p.roundRunning,
              updatedAt: Date.now()
            };
          });
          saveDb(db);
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // LOGBOOK
        if (action === 'logbook') {
          return new Response(JSON.stringify({ ok: true, entries: db.logbook }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // PAYMENT
        if (action === 'payment') {
          const entry = db.logbook.find(e => e.id === Number(body.id));
          if (entry) {
            if (body.amount !== undefined) entry.amount = Number(body.amount);
            if (body.status !== undefined) entry.payment_status = body.status;
            saveDb(db);
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // ===================================
      // 3. /api/court_rentals.php
      // ===================================
      if (pathname.endsWith('court_rentals.php')) {
        if (method === 'GET') {
          return new Response(JSON.stringify({ ok: true, rows: db.courtRentals }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'POST') {
          const newId = db.courtRentals.length ? Math.max(...db.courtRentals.map(r => r.id)) + 1 : 1;
          const dur = Number(body.dur || 1);
          const rate = Number(body.rate || 0);
          const persons = Number(body.persons || 1);
          const personRate = Number(body.personRate || 0);
          const amount = dur * rate + persons * personRate;
          const newRental = {
            id: newId,
            customer: body.customer || 'Customer',
            contact_number: body.contact || '',
            person_count: persons,
            hourly_rate: rate,
            person_rate: personRate,
            court: body.court || 'Court 1',
            rental_date: body.date || todayStr,
            start_time: body.start || '14:00',
            duration: dur,
            amount,
            status: 'Booked',
            created_at: todayStr + ' 10:00:00'
          };
          db.courtRentals.unshift(newRental);
          saveDb(db);
          return new Response(JSON.stringify({ ok: true, id: newId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'PUT') {
          const id = Number(query.id || body.id);
          const r = db.courtRentals.find(x => x.id === id);
          if (r && body.status) {
            r.status = body.status;
            saveDb(db);
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'DELETE') {
          const id = Number(query.id || body.id);
          db.courtRentals = db.courtRentals.filter(x => x.id !== id);
          saveDb(db);
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ ok: true, rows: db.courtRentals }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // ===================================
      // 4. /api/paddle_rentals.php
      // ===================================
      if (pathname.endsWith('paddle_rentals.php')) {
        if (method === 'GET') {
          return new Response(JSON.stringify({ ok: true, rows: db.paddleRentals, stock: { paddles: 20, balls: 50 } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'POST') {
          const newId = db.paddleRentals.length ? Math.max(...db.paddleRentals.map(r => r.id)) + 1 : 1;
          const paddles = Number(body.paddles || 0);
          const balls = Number(body.balls || 0);
          const paddleRate = Number(body.paddleRate || 50);
          const ballRate = Number(body.ballRate || 20);
          const amount = paddles * paddleRate + balls * ballRate;
          const newRental = {
            id: newId,
            customer: body.customer || 'Customer',
            contact_number: body.contact || '',
            paddles,
            balls,
            paddle_rate: paddleRate,
            ball_rate: ballRate,
            amount,
            return_time: body.returnTime || '18:00',
            status: 'Rented',
            returned_at: null,
            created_at: todayStr + ' ' + nowTimeStr
          };
          db.paddleRentals.unshift(newRental);
          saveDb(db);
          return new Response(JSON.stringify({ ok: true, id: newId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'PUT') {
          const id = Number(query.id || body.id);
          const r = db.paddleRentals.find(x => x.id === id);
          if (r) {
            r.status = 'Returned';
            r.returned_at = todayStr + ' ' + nowTimeStr;
            saveDb(db);
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'DELETE') {
          const id = Number(query.id || body.id);
          db.paddleRentals = db.paddleRentals.filter(x => x.id !== id);
          saveDb(db);
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ ok: true, rows: db.paddleRentals }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // ===================================
      // 5. /api/users.php
      // ===================================
      if (pathname.endsWith('users.php')) {
        const id = Number(query.id || body.id);
        if (method === 'POST') {
          const newId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
          const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
          const u = {
            id: newId,
            name: body.name || 'New User',
            email: body.email || '',
            role: body.role || 'Staff',
            status: body.status || 'Active',
            created: nowStr,
            created_at: nowStr
          };
          db.users.push(u);
          saveDb(db);
          return new Response(JSON.stringify({ ok: true, id: newId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'PUT') {
          const item = db.users.find(u => u.id === id);
          if (item) {
            if (body.name) item.name = body.name;
            if (body.email) item.email = body.email;
            if (body.role) item.role = body.role;
            if (body.status) item.status = body.status;
            saveDb(db);
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'DELETE') {
          db.users = db.users.filter(u => u.id !== id);
          saveDb(db);
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ ok: true, rows: db.users, users: db.users }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // ===================================
      // 6. /api/suppliers.php
      // ===================================
      if (pathname.endsWith('suppliers.php')) {
        const id = Number(query.id || body.id);
        if (method === 'POST') {
          const newId = db.suppliers.length ? Math.max(...db.suppliers.map(s => s.id)) + 1 : 1;
          db.suppliers.push({
            id: newId,
            name: body.name || '',
            contact_person: body.contact || '',
            phone: body.phone || '',
            email: body.email || '',
            address: body.address || '',
            status: 'Active'
          });
          saveDb(db);
          return new Response(JSON.stringify({ ok: true, id: newId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'PUT') {
          const item = db.suppliers.find(s => s.id === id);
          if (item) {
            if (body.name) item.name = body.name;
            if (body.contact) item.contact_person = body.contact;
            if (body.phone) item.phone = body.phone;
            if (body.email) item.email = body.email;
            if (body.address) item.address = body.address;
            saveDb(db);
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'DELETE') {
          db.suppliers = db.suppliers.filter(s => s.id !== id);
          saveDb(db);
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ ok: true, rows: db.suppliers, suppliers: db.suppliers }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // ===================================
      // 7. /api/stock.php
      // ===================================
      if (pathname.endsWith('stock.php')) {
        const type = query.type || '';
        if (method === 'POST') {
          if (type === 'out') {
            const newId = db.stockOut.length ? Math.max(...db.stockOut.map(s => s.id)) + 1 : 1;
            db.stockOut.unshift({
              id: newId,
              product_name: body.product || '',
              qty: Number(body.qty || 1),
              reason: body.reason || '',
              issued_to: body.issuedTo || '',
              entry_date: body.date || todayStr,
              processed_by: body.by || 'Admin',
              notes: body.notes || ''
            });
            saveDb(db);
            return new Response(JSON.stringify({ ok: true, id: newId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          } else {
            const newId = db.stockIn.length ? Math.max(...db.stockIn.map(s => s.id)) + 1 : 1;
            db.stockIn.unshift({
              id: newId,
              product_name: body.product || '',
              supplier_name: body.supplier || '',
              qty: Number(body.qty || 1),
              unit_cost: Number(body.cost || 0),
              entry_date: body.date || todayStr,
              received_by: body.by || 'Admin',
              notes: body.notes || ''
            });
            saveDb(db);
            return new Response(JSON.stringify({ ok: true, id: newId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
        }
        if (type === 'out') {
          return new Response(JSON.stringify({ ok: true, rows: db.stockOut, stockOut: db.stockOut }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ ok: true, rows: db.stockIn, stockIn: db.stockIn }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // ===================================
      // 8. /api/products.php
      // ===================================
      if (pathname.endsWith('products.php')) {
        const id = Number(query.id || body.id);
        if (method === 'POST') {
          const newId = db.products.length ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
          db.products.push({
            id: newId,
            name: body.name || '',
            category: body.category || 'Paddle',
            stock: Number(body.stock || 0),
            reorder_level: Number(body.reorder || 5),
            price: Number(body.price || 0),
            status: 'In Stock'
          });
          saveDb(db);
          return new Response(JSON.stringify({ ok: true, id: newId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'PUT') {
          const item = db.products.find(p => p.id === id);
          if (item) {
            if (body.name) item.name = body.name;
            if (body.category) item.category = body.category;
            if (body.stock !== undefined) item.stock = Number(body.stock);
            if (body.reorder !== undefined) item.reorder_level = Number(body.reorder);
            if (body.price !== undefined) item.price = Number(body.price);
            saveDb(db);
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (method === 'DELETE') {
          db.products = db.products.filter(p => p.id !== id);
          saveDb(db);
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (id) {
          const p = db.products.find(x => x.id === id);
          return new Response(JSON.stringify({ ok: true, product: p }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ ok: true, rows: db.products, products: db.products }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    }

    return originalFetch.apply(this, arguments);
  };
})();
