function opEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function opDialog(id) {
  let dialog = document.getElementById(id);
  if (!dialog) {
    dialog = document.createElement('dialog'); dialog.id = id; dialog.className = 'op-dialog';
    document.body.appendChild(dialog);
  }
  return dialog;
}
function opError(message) {
  const dialog = opDialog('opErrorDialog');
  dialog.setAttribute('aria-labelledby', 'opErrorTitle');
  dialog.innerHTML = `<button class="dialog-close" aria-label="Close error" onclick="this.closest('dialog').close()">×</button><h3 id="opErrorTitle">Unable to continue</h3><p>${opEscape(message)}</p><button autofocus class="btn cancel-error" onclick="this.closest('dialog').close()">Cancel</button>`;
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('.cancel-error').focus();
}
function opToggleCourt(index) {
  const court = opCourtState[index];
  if (!court || !court.players.length) return;
  if (!court.running && court.players.some(id => opGetPlayerRemaining(id) <= 0 || opGetPlayerCourtRemaining(id) <= 0)) {
    opError('Time has expired. End this match to record the result.'); return;
  }
  if (court.running) opPauseCourtTimer(index); else opStartCourtTimer(index);
}
async function opEndMatch(index) {
  const court = opCourtState[index];
  if (!court?.players.length) return;
  opPauseCourtTimer(index);
  if (typeof opSaveCourtMatchResultAndQueue === 'function') {
    await opSaveCourtMatchResultAndQueue(court.courtNumber);
  }
}
function opRenderMatchDialog(courtNum) {
  if (typeof opSaveCourtMatchResultAndQueue === 'function') {
    opSaveCourtMatchResultAndQueue(courtNum);
  }
}
async function opConfirmMatch(courtNum) {
  if (typeof opSaveCourtMatchResultAndQueue === 'function') {
    await opSaveCourtMatchResultAndQueue(courtNum);
  }
}
let opTimerSyncTask;
let opTimerSyncChain = Promise.resolve();
function opScheduleTimerSync() {
  clearTimeout(opTimerSyncTask);
  opTimerSyncTask = setTimeout(() => {
    if (!opSessionId) return;
    const payload = {sessionId: opSessionId, players: opPlayers.map(p => ({
      id:p.id, remaining:opGetPlayerRemaining(p.id), roundRemaining:opGetPlayerCourtRemaining(p.id),
      running:opGetPlayerStartedAt(p.id)!==null, roundRunning:opGetPlayerCourtStartedAt(p.id)!==null
    }))};
    opTimerSyncChain = opTimerSyncChain.catch(()=>{}).then(async () => {
      const r = await api('open_play.php?action=sync_timers', {method:'POST',body:JSON.stringify(payload)});
      if (!r.ok) throw new Error(r.error || 'Could not save timers');
    }).catch(error=>showToast('Timer synchronization failed: '+error.message,'error'));
  }, 100);
}
function opRestoreTimers(rows) {
  rows.forEach(row => {
    const id = Number(row.player_id);
    localStorage.setItem(opPlayerTimerKey(id,'remaining'),row.remaining);
    localStorage.setItem(opPlayerCourtTimerKey(id,'remaining'),row.roundRemaining);
    for (const [key,running] of [[opPlayerTimerKey(id,'started'),row.running],[opPlayerCourtTimerKey(id,'started'),row.roundRunning]]) {
      if (running) localStorage.setItem(key,Date.now()); else localStorage.removeItem(key);
    }
  });
}
let opLogEntries = [];
async function opLoadLog() {
  const input = document.getElementById('opLogDate');
  if (!input.value) input.value = new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Manila'});
  try {
    const r = await api('open_play.php?action=logbook&period='+document.getElementById('opLogPeriod').value+'&date='+input.value);
    if (!r.ok) throw new Error(r.error);
    opLogEntries = r.entries;
    document.getElementById('opLogSummary').textContent = `${r.entries.length} player registration(s)`;
    document.getElementById('opLogRows').innerHTML = r.entries.map((e, idx) => {
      let expiredDisplay = '—';
      let actionBtn = '—';
      if (e.expired_at) {
        expiredDisplay = `<span class="badge red" style="font-size:11px;" title="Expired at ${opEscape(e.expired_at)}">⏰ ${opEscape(e.expired_at)}</span>`;
        actionBtn = `<button class="btn btn-primary" style="font-size:11px;padding:3px 8px;border-radius:6px;" onclick="opReRegisterFromLog('${opEscape(e.player_name)}', '${e.player_type}')" title="Re-register this player for a new 4-hour session">🔄 Re-register</button>`;
      } else {
        expiredDisplay = '<span class="badge" style="font-size:11px;background:rgba(34,197,94,0.18);color:#16a34a;border:1px solid rgba(34,197,94,0.3);">🟢 Active</span>';
        actionBtn = '<span style="font-size:11px;color:var(--text-muted);font-style:italic;">In Session</span>';
      }
      return `<tr>
        <td>${idx + 1}</td>
        <td>${opEscape(e.registered_at)}</td>
        <td><strong>${opEscape(e.player_name)}</strong></td>
        <td>${e.player_type === 'Newbie' ? '<span class="badge-type-n">🟠 Novice</span>' : '<span class="badge-type-b">🔵 Beginner</span>'}</td>
        <td>${expiredDisplay}</td>
        <td>Session #${Number(e.session_id)}</td>
        <td>${actionBtn}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="7">No registrations for this period.</td></tr>';
  } catch(error) { opError('Could not load logbook: '+error.message); }
}
function opEditPayment(id) {
  const entry = opLogEntries.find(e=>Number(e.id)===id); if (!entry) return;
  const dialog = opDialog('opPaymentDialog');
  dialog.innerHTML = `<button class="dialog-close" aria-label="Close payment" onclick="this.closest('dialog').close()">×</button><h3>Payment · ${opEscape(entry.player_name)}</h3><label>Amount (₱)<input id="opEditAmount" type="number" min="0" step="0.01" value="${Number(entry.amount)}"></label><select id="opEditStatus"><option value="unpaid" ${entry.payment_status==='unpaid'?'selected':''}>Unpaid</option><option value="paid" ${entry.payment_status==='paid'?'selected':''}>Paid</option></select><button class="btn btn-primary" onclick="opSavePayment(${id})">Save</button>`;
  dialog.showModal();
}
async function opSavePayment(id) {
  try {
    const r = await api('open_play.php?action=payment',{method:'POST',body:JSON.stringify({id,amount:Number(document.getElementById('opEditAmount').value),paymentStatus:document.getElementById('opEditStatus').value})});
    if (!r.ok) throw new Error(r.error);
    document.getElementById('opPaymentDialog').close(); await opLoadLog(); renderSales();
  } catch(error) { opError(error.message); }
}
function opExportLog() {
  const rows = [
    ['#', 'Registered', 'Player', 'Skill', 'Status / Expired Time', 'Session'],
    ...opLogEntries.map((e, idx) => [
      idx + 1,
      e.registered_at,
      e.player_name,
      e.player_type === 'Newbie' ? 'Novice' : 'Beginner',
      e.expired_at ? `Expired (${e.expired_at})` : 'Active',
      e.session_id
    ])
  ];
  const csv = rows.map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a'); a.href = url; a.download = 'open-play-logbook.csv'; a.click(); URL.revokeObjectURL(url);
}
