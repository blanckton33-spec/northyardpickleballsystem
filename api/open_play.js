import {
  session,
  players,
  courtState,
  courtTimers,
  queue,
  syncedTimers,
  matchResults,
  logbook,
  getGamesPlayed,
  setPlayers,
  setQueue
} from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query || {};
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }
  const method = req.method;
  const action = query.action || '';

  // 1. DELETE / remove_player
  if (method === 'DELETE' || action === 'remove_player') {
    const pid = Number(query.playerId || body.playerId);
    const isExpired = query.expired === '1' || body.expired === true;
    if (pid) {
      const lb = logbook.find(x => x.player_id === pid && !x.expired_at);
      if (lb && (isExpired || lb.expired_at === undefined)) {
        lb.expired_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
      }
      setQueue(queue.filter(q => q.player_id !== pid));
      courtState.forEach(c => {
        c.players = c.players.filter(id => id !== pid);
      });
      const p = players.find(x => x.id === pid);
      if (p) p.courtNumber = null;

      if (syncedTimers[pid]) {
        syncedTimers[pid].remaining = 0;
        syncedTimers[pid].running = false;
        syncedTimers[pid].roundRunning = false;
      }

      if (isExpired) {
        if (p) p.expired = true;
      } else {
        setPlayers(players.filter(x => x.id !== pid));
        delete syncedTimers[pid];
        session.total_players = players.length;
      }
    }
    return res.status(200).json({ ok: true });
  }

  // 2. CURRENT
  if (action === 'current') {
    return res.status(200).json({
      ok: true,
      session,
      courts: courtState.map(c => ({
        courtNumber: String(c.courtNumber),
        players: c.players.map(pid => {
          const p = players.find(x => x.id === pid);
          return p ? { id: p.id, name: p.name, playerType: p.playerType, registeredAt: p.registeredAt, gamesPlayed: getGamesPlayed(p.id) } : null;
        }).filter(Boolean),
        timer: courtTimers[c.courtNumber] || null
      })),
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        registeredAt: p.registeredAt,
        courtNumber: p.courtNumber,
        playerType: p.playerType,
        expired: p.expired || false,
        gamesPlayed: getGamesPlayed(p.id)
      })),
      queue: queue.map(q => ({
        queue_number: q.queue_number,
        position_in_queue: q.position_in_queue,
        player_id: q.player_id,
        playerName: q.playerName,
        playerType: q.playerType,
        lastResult: q.lastResult || null,
        gamesPlayed: getGamesPlayed(q.player_id)
      })),
      timers: [1, 2, 3].map(c => ({
        courtNumber: String(c),
        started_at: courtTimers[c]?.started_at || null,
        paused_at: courtTimers[c]?.paused_at || null
      })),
      timerState: players.map(p => {
        const st = syncedTimers[p.id];
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
    });
  }

  // 3. GET_DISPLAY_DATA
  if (action === 'get_display_data') {
    return res.status(200).json({
      ok: true,
      session,
      courts: courtState.map(c => {
        const cNum = String(c.courtNumber);
        const cTimer = courtTimers[cNum];
        return {
          courtNumber: cNum,
          startedAt: cTimer?.started_at || null,
          pausedAt: cTimer?.paused_at || null,
          players: c.players.map(pid => {
            const p = players.find(x => x.id === pid);
            return p ? { id: p.id, name: p.name, playerType: p.playerType, registeredAt: p.registeredAt, courtNumber: p.courtNumber, gamesPlayed: getGamesPlayed(p.id) } : null;
          }).filter(Boolean)
        };
      }),
      timers: courtTimers,
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        courtNumber: p.courtNumber,
        playerType: p.playerType,
        expired: p.expired || false,
        gamesPlayed: getGamesPlayed(p.id)
      })),
      queue: queue.map(q => ({
        ...q,
        gamesPlayed: getGamesPlayed(q.player_id)
      })),
      timerState: players.map(p => {
        const st = syncedTimers[p.id];
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
    });
  }

  // 4. ADD_PLAYER
  if (action === 'add_player') {
    const name = (body.name || '').trim();
    let rawType = (body.playerType || 'Beginner').trim();
    if (rawType.toLowerCase() === 'novice') rawType = 'Newbie';
    const playerType = ['Newbie', 'Beginner'].includes(rawType) ? rawType : 'Beginner';
    const registeredAt = body.registeredAt || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const existingIdx = players.findIndex(p => p.name.trim().toLowerCase() === name.toLowerCase());
    if (existingIdx !== -1) {
      const existingPlayer = players[existingIdx];
      const timer = syncedTimers[existingPlayer.id];
      const isTimerExpired = existingPlayer.expired || (timer && timer.remaining <= 0);
      if (!isTimerExpired) {
        return res.status(400).json({ ok: false, error: 'Player "' + name + '" is already registered.' });
      }
      players.splice(existingIdx, 1);
      delete syncedTimers[existingPlayer.id];
    }

    const newId = (players.length ? Math.max(...players.map(p => p.id)) : 0) + 1;
    const newPlayer = { id: newId, name, playerType, registeredAt, courtNumber: null, expired: false };
    players.push(newPlayer);
    session.total_players = players.length;

    syncedTimers[newId] = {
      player_id: newId,
      remaining: 14400,
      roundRemaining: 900,
      running: true,
      roundRunning: false,
      updatedAt: Date.now()
    };

    logbook.unshift({
      id: Date.now(),
      player_id: newId,
      session_id: session.id,
      player_name: name,
      player_type: playerType,
      registered_at: new Date().toISOString().slice(0, 10) + ' ' + registeredAt,
      expired_at: null,
      amount: Number(body.amount) || 200,
      payment_status: body.paymentStatus || 'unpaid'
    });

    return res.status(200).json({ ok: true, playerId: newId, player: newPlayer });
  }

  // 5. UPDATE_PLAYER_TYPE
  if (action === 'update_player_type') {
    const pid = Number(body.playerId);
    let rawType = (body.playerType || 'Beginner').trim();
    if (rawType.toLowerCase() === 'novice') rawType = 'Newbie';
    const playerType = ['Newbie', 'Beginner'].includes(rawType) ? rawType : 'Beginner';

    const p = players.find(x => x.id === pid);
    if (p) p.playerType = playerType;
    const qItem = queue.find(x => x.player_id === pid);
    if (qItem) qItem.playerType = playerType;
    const lb = logbook.find(x => x.player_id === pid);
    if (lb) lb.player_type = playerType;

    return res.status(200).json({ ok: true, playerType });
  }

  // 6. ASSIGN_COURT
  if (action === 'assign_court') {
    const pid = Number(body.playerId);
    const courtNum = String(body.courtNumber || '1');
    const c = courtState.find(x => x.courtNumber === courtNum);
    if (c && !c.players.includes(pid)) {
      c.players.push(pid);
      const p = players.find(x => x.id === pid);
      if (p) p.courtNumber = courtNum;
      setQueue(queue.filter(x => x.player_id !== pid));
    }
    return res.status(200).json({ ok: true });
  }

  // 7. UNASSIGN_COURT
  if (action === 'unassign_court') {
    const pid = Number(body.playerId);
    courtState.forEach(c => {
      c.players = c.players.filter(id => id !== pid);
    });
    const p = players.find(x => x.id === pid);
    if (p) p.courtNumber = null;
    return res.status(200).json({ ok: true });
  }

  // 8. ADD_TO_QUEUE
  if (action === 'add_to_queue') {
    const pid = Number(body.playerId);
    const qn = Number(body.queueNumber || 1);
    const p = players.find(x => x.id === pid);
    if (p) {
      setQueue(queue.filter(x => x.player_id !== pid));
      const currentInQ = queue.filter(x => x.queue_number === qn);
      if (currentInQ.length < 4) {
        queue.push({
          id: Date.now(),
          session_id: session.id,
          queue_number: qn,
          player_id: pid,
          playerName: p.name,
          playerType: p.playerType,
          position_in_queue: currentInQ.length + 1,
          lastResult: null
        });
      }
    }
    return res.status(200).json({ ok: true });
  }

  // 9. SWAP_QUEUES
  if (action === 'swap_queues') {
    const q1 = Number(body.queue1);
    const q2 = Number(body.queue2);
    if (q1 && q2) {
      queue.forEach(q => {
        if (q.queue_number === q1) q.queue_number = -999;
      });
      queue.forEach(q => {
        if (q.queue_number === q2) q.queue_number = q1;
      });
      queue.forEach(q => {
        if (q.queue_number === -999) q.queue_number = q2;
      });
    }
    return res.status(200).json({ ok: true });
  }

  // 10. REMOVE_FROM_QUEUE
  if (action === 'remove_from_queue') {
    const pid = Number(body.playerId);
    setQueue(queue.filter(x => x.player_id !== pid));
    return res.status(200).json({ ok: true });
  }

  // 11. DELETE_QUEUE
  if (action === 'delete_queue') {
    const qn = Number(body.queueNumber);
    setQueue(queue.filter(x => x.queue_number !== qn));
    queue.forEach(q => {
      if (q.queue_number > qn) q.queue_number -= 1;
    });
    return res.status(200).json({ ok: true });
  }

  // 12. SEND_QUEUE_TO_COURT
  if (action === 'send_queue_to_court') {
    const qn = Number(body.queueNumber);
    const courtNum = String(body.courtNumber);
    const c = courtState.find(x => x.courtNumber === courtNum);
    const qItems = queue.filter(x => x.queue_number === qn);
    if (c) {
      c.players = qItems.map(q => q.player_id);
      c.players.forEach(pid => {
        const p = players.find(x => x.id === pid);
        if (p) p.courtNumber = courtNum;
      });
      setQueue(queue.filter(x => x.queue_number !== qn));
      queue.forEach(q => {
        if (q.queue_number > qn) q.queue_number -= 1;
      });
      courtTimers[courtNum] = { court_number: courtNum, started_at: new Date().toISOString(), paused_at: null };
    }
    return res.status(200).json({ ok: true });
  }

  // 13. TIMERS
  if (action === 'start_timer' || action === 'pause_timer' || action === 'reset_timer') {
    const courtNum = String(body.courtNumber || '1');
    if (action === 'start_timer') {
      courtTimers[courtNum] = { court_number: courtNum, started_at: new Date().toISOString(), paused_at: null };
    } else if (action === 'pause_timer') {
      courtTimers[courtNum] = { court_number: courtNum, started_at: null, paused_at: new Date().toISOString() };
    } else {
      courtTimers[courtNum] = { court_number: courtNum, started_at: null, paused_at: null };
    }
    return res.status(200).json({ ok: true });
  }

  // 14. FINISH_MATCH / RECORD_MATCH_RESULT (AUTOMATIC 2-AND-2 SPLIT)
  if (action === 'record_match_result' || action === 'finish_match') {
    const courtNum = String(body.courtNumber);
    const c = courtState.find(x => x.courtNumber === courtNum);
    if (c && c.players.length) {
      const cPlayers = [...c.players];
      c.players = [];
      c.running = false;
      cPlayers.forEach(pid => {
        const p = players.find(x => x.id === pid);
        if (p) p.courtNumber = null;
        setQueue(queue.filter(x => x.player_id !== pid));
      });

      if (Array.isArray(body.assignments) && body.assignments.length) {
        body.assignments.forEach((a, idx) => {
          const pid = Number(a.playerId);
          const qn = Number(a.queueNumber || 1);
          const resType = a.result || 'played';
          const p = players.find(x => x.id === pid);
          if (!p) return;
          if (cPlayers.includes(pid)) {
            matchResults.push({ session_id: session.id, court_number: courtNum, player_id: pid, result: resType });
          }
          const currentQ = queue.filter(x => x.queue_number === qn);
          if (currentQ.length < 4) {
            queue.push({
              id: Date.now() + idx,
              session_id: session.id,
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
          const p = players.find(x => x.id === pid);
          return p && p.playerType === 'Newbie';
        });
        const beginners = cPlayers.filter(pid => {
          const p = players.find(x => x.id === pid);
          return !p || p.playerType !== 'Newbie';
        });

        let nextQ = queue.length ? Math.max(...queue.map(q => q.queue_number)) + 1 : 1;
        [novices, beginners].forEach(grp => {
          if (!grp.length) return;
          const shuffled = [...grp].sort(() => Math.random() - 0.5);
          shuffled.forEach((pid, idx) => {
            const p = players.find(x => x.id === pid);
            if (!p) return;
            const resType = winners.includes(pid) ? 'win' : 'loss';
            matchResults.push({ session_id: session.id, court_number: courtNum, player_id: pid, result: resType });
            const targetQ = nextQ + Math.floor(idx / 2);
            const currentQ = queue.filter(x => x.queue_number === targetQ);
            queue.push({
              id: Date.now() + idx + Math.random(),
              session_id: session.id,
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

      courtTimers[courtNum] = { court_number: courtNum, started_at: null, paused_at: null };
    }
    return res.status(200).json({ ok: true });
  }

  // 15. SYNC_TIMERS
  if (action === 'sync_timers') {
    const pList = body.players || [];
    pList.forEach(p => {
      syncedTimers[p.id] = {
        player_id: p.id,
        remaining: Number(p.remaining),
        roundRemaining: Number(p.roundRemaining),
        running: !!p.running,
        roundRunning: !!p.roundRunning,
        updatedAt: Date.now()
      };
    });
    return res.status(200).json({ ok: true });
  }

  // 16. LOGBOOK
  if (action === 'logbook') {
    return res.status(200).json({ ok: true, entries: logbook });
  }

  // 17. PAYMENT
  if (action === 'payment') {
    const entry = logbook.find(e => e.id === Number(body.id));
    if (entry) {
      if (body.amount !== undefined) entry.amount = Number(body.amount);
      if (body.status !== undefined) entry.payment_status = body.status;
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
