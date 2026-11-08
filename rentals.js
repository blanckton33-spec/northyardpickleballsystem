function rentalToday() { return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
function rentalMoney(value) { return '₱'+Number(value||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function rentalNumber(id) { const el=document.getElementById(id);if(!el) return NaN;const value=el.value;return value.trim()===''?NaN:Number(value); }
function rentalInitialize() {
  for (const id of ['crRate','crPersonRate','prPaddleRate','prBallRate']) {
    const field=document.getElementById(id);
    if (field && !field.dataset.initialized) { field.value=localStorage.getItem('rental_rate_'+id)||'';field.dataset.initialized='1'; }
  }
  if (!document.getElementById('crDate').value) document.getElementById('crDate').value=rentalToday();
  rentalTotals();
}
function rentalTotals() {
  const dur = rentalNumber('crDuration') || 0;
  const rate = rentalNumber('crRate') || 0;
  const persons = rentalNumber('crPersons') || 0;
  const personRate = rentalNumber('crPersonRate') || 0;
  const courtTotal = dur * rate;
  const personTotal = persons * personRate;
  const total = courtTotal + personTotal;
  const totalEl = document.getElementById('crTotal');
  if (totalEl) totalEl.textContent = 'Total: ' + rentalMoney(total);
  const bd = document.getElementById('crTotalBreakdown');
  if (bd) {
    bd.textContent = `Court: ${rentalMoney(courtTotal)} (${dur} hr · ${rentalMoney(rate)}/hr) + Persons: ${rentalMoney(personTotal)} (${persons} person · ${rentalMoney(personRate)}/ea)`;
  }
  const prTotalEl = document.getElementById('prTotal');
  if (prTotalEl) prTotalEl.textContent = 'Total: ' + rentalMoney((rentalNumber('prPaddles')||0)*(rentalNumber('prPaddleRate')||0)+(rentalNumber('prBalls')||0)*(rentalNumber('prBallRate')||0));
}
function crResetForm() {
  for (const id of ['crCustomer','crContact','crCourt','crStart']) document.getElementById(id).value='';
  const crp = document.getElementById('crPersonRate'); if (crp) crp.value = '';
  document.getElementById('crPersons').value=1;document.getElementById('crDuration').value=1;document.getElementById('crDate').value=rentalToday();rentalTotals();
}
async function crSaveBooking() {
  const p={customer:$('crCustomer').value.trim(),contact:$('crContact').value.trim(),persons:rentalNumber('crPersons'),court:$('crCourt').value,date:$('crDate').value,start:$('crStart').value,dur:rentalNumber('crDuration'),rate:rentalNumber('crRate'),personRate:rentalNumber('crPersonRate')||0};
  if (!p.customer || !/^[+0-9() .-]{7,30}$/.test(p.contact) || !p.court || !p.date || !p.start || !Number.isInteger(p.persons) || p.persons<1 || !Number.isFinite(p.dur) || p.dur<=0 || !Number.isFinite(p.rate) || p.rate<0) { opError('Enter the customer, contact number, group size, court, date, time, duration and hourly rate.');return; }
  const button=$('crSaveButton');button.disabled=true;
  try {
    const r=await api('court_rentals.php',{method:'POST',body:JSON.stringify(p)});if(!r.ok) throw new Error(r.error);
    localStorage.setItem('rental_rate_crRate',p.rate);
    if (p.personRate) localStorage.setItem('rental_rate_crPersonRate',p.personRate);
    CR_BOOKINGS=(await api('court_rentals.php')).rows||[];
    $('crFilterDate').value=p.date;crResetForm();crRender();showToast('Booking saved.','success');
  } catch(error) { opError(error.message); } finally { button.disabled=false; }
}
function crRender() {
  const filter=$('crFilterDate').value,search=$('crSearch').value.trim().toLowerCase();
  const rows=CR_BOOKINGS.filter(b=>(!filter||b.rental_date===filter)&&(!search||[b.customer,b.contact_number,b.court].join(' ').toLowerCase().includes(search)));
  $('crBookingsBody').innerHTML=rows.map(b=>`<tr><td><strong>${opEscape(b.customer)}</strong><small>${opEscape(b.contact_number||'No contact saved')}</small></td><td>${opEscape(b.court)}<small>${Number(b.person_count||1)} person(s)</small></td><td>${opEscape(b.rental_date)}<small>${opEscape(b.start_time)}</small></td><td>${Number(b.duration)} hr<small>${b.hourly_rate===null||b.hourly_rate===undefined?'Rate not saved':rentalMoney(b.hourly_rate)+'/hr'}</small></td><td>${rentalMoney(b.amount)}</td><td>${opEscape(b.status)}</td><td>${b.status==='Booked'?`<button class="btn btn-outline" onclick="crStatus(${Number(b.id)},'Ongoing')">Start</button>`:''}${b.status==='Ongoing'?`<button class="btn btn-primary" onclick="crStatus(${Number(b.id)},'Completed')">Complete</button>`:''}${['Booked','Ongoing'].includes(b.status)?`<button class="btn btn-secondary" onclick="crCancel(${Number(b.id)})">Cancel</button>`:''}</td></tr>`).join('')||'<tr><td colspan="7">No matching bookings.</td></tr>';
  $('crFilterInfo').textContent=`${filter?'Bookings on '+filter:'All dates'} · ${rows.length} result(s)`;
  $('crTodayBookings').textContent=CR_BOOKINGS.filter(b=>b.rental_date===rentalToday()&&b.status!=='Cancelled').length;
  $('crOngoing').textContent=CR_BOOKINGS.filter(b=>b.status==='Ongoing').length;
  $('crRevenue').textContent=rentalMoney(rows.filter(b=>b.status!=='Cancelled').reduce((sum,b)=>sum+Number(b.amount),0));
}
function crFilterToday() { $('crFilterDate').value=rentalToday();crRender(); }
function crClearFilter() { $('crFilterDate').value='';crRender(); }
async function crStatus(id,status) {
  try { const r=await api('court_rentals.php?id='+id,{method:'PUT',body:JSON.stringify({status})});if(!r.ok) throw new Error(r.error);CR_BOOKINGS=(await api('court_rentals.php')).rows||[];crRender(); }
  catch(error) { opError(error.message); }
}
function crCancel(id) {
  const dialog=opDialog('rentalCancelDialog');
  dialog.innerHTML=`<button class="dialog-close" aria-label="Close" onclick="this.closest('dialog').close()">×</button><h3>Cancel this booking?</h3><p>The booking remains in the history and is excluded from sales totals.</p><button class="btn btn-primary" autofocus onclick="this.closest('dialog').close()">Keep booking</button> <button class="btn btn-secondary" onclick="crStatus(${Number(id)},'Cancelled');this.closest('dialog').close()">Cancel booking</button>`;dialog.showModal();
}
function prResetForm() {
  for(const id of ['prCustomer','prContact','prReturnTime']) $(id).value='';
  $('prPaddles').value=0;$('prBalls').value=0;rentalTotals();
}
async function prSaveRental() {
  const paddles=rentalNumber('prPaddles'),balls=rentalNumber('prBalls');
  const p={customer:$('prCustomer').value.trim(),contact:$('prContact').value.trim(),paddles,balls,pr:paddles?rentalNumber('prPaddleRate'):0,br:balls?rentalNumber('prBallRate'):0,returnTime:$('prReturnTime').value};
  if(!p.customer||!/^[+0-9() .-]{7,30}$/.test(p.contact)||!p.returnTime||!Number.isInteger(paddles)||!Number.isInteger(balls)||paddles<0||balls<0||paddles+balls<1||!Number.isFinite(p.pr)||!Number.isFinite(p.br)||p.pr<0||p.br<0) { opError('Enter a customer, contact number, at least one item, its rate and the return time.');return; }
  const button=$('prSaveButton');button.disabled=true;
  try {
    const r=await api('paddle_rentals.php',{method:'POST',body:JSON.stringify(p)});if(!r.ok) throw new Error(r.error);
    if(paddles) localStorage.setItem('rental_rate_prPaddleRate',p.pr);if(balls) localStorage.setItem('rental_rate_prBallRate',p.br);
    PR_RENTALS=(await api('paddle_rentals.php')).rows||[];$('prStatusFilter').value='Rented';$('prFilterDate').value=rentalToday();prResetForm();prRender();showToast('Rental saved.','success');
  } catch(error) { opError(error.message); } finally { button.disabled=false; }
}
function prRender() {
  const date=$('prFilterDate').value,search=$('prSearch').value.trim().toLowerCase(),status=$('prStatusFilter').value;
  const rows=PR_RENTALS.filter(r=>(!date||String(r.created_at).slice(0,10)===date)&&(!status||(r.status||'Rented')===status)&&(!search||[r.customer,r.contact_number].join(' ').toLowerCase().includes(search)));
  $('prRentalsBody').innerHTML=rows.map(r=>`<tr><td><strong>${opEscape(r.customer)}</strong><small>${opEscape(r.contact_number||'No contact saved')}</small></td><td>${Number(r.paddles)} paddle(s) · ${Number(r.balls)} ball(s)<small>${r.paddle_rate==null?'—':rentalMoney(r.paddle_rate)} / paddle · ${r.ball_rate==null?'—':rentalMoney(r.ball_rate)} / ball</small></td><td>${rentalMoney(r.amount)}</td><td>${opEscape(String(r.created_at||'').slice(0,10))}<small>Due ${opEscape(r.return_time||'—')}</small>${r.returned_at?`<small>Returned ${opEscape(r.returned_at)}</small>`:''}</td><td>${opEscape(r.status||'Rented')}</td><td>${r.status!=='Returned'?`<button class="btn btn-primary" onclick="prReturn(${Number(r.id)})">Mark returned</button>`:'—'}</td></tr>`).join('')||'<tr><td colspan="6">No matching rentals.</td></tr>';
  $('prFilterInfo').textContent=`${date?'Rentals on '+date:'All dates'} · ${rows.length} result(s)`;
  const active=PR_RENTALS.filter(r=>r.status!=='Returned');
  $('prTotalPaddles').textContent=active.reduce((sum,r)=>sum+Number(r.paddles),0);$('prTotalBalls').textContent=active.reduce((sum,r)=>sum+Number(r.balls),0);
  $('prCurrentlyRented').textContent=active.reduce((sum,r)=>sum+Number(r.paddles)+Number(r.balls),0);$('prRevenue').textContent=rentalMoney(rows.reduce((sum,r)=>sum+Number(r.amount),0));
}
async function prReturn(id) {
  try { const r=await api('paddle_rentals.php?id='+id,{method:'PUT'});if(!r.ok) throw new Error(r.error);PR_RENTALS=(await api('paddle_rentals.php')).rows||[];prRender();showToast('Items returned. Sale kept in history.','success'); }
  catch(error) { opError(error.message); }
}
function prFilterToday() { $('prFilterDate').value=rentalToday();prRender(); }
function prClearFilter() { $('prFilterDate').value='';prRender(); }
let salesEntries=[];
function reportDateMatches(value) {
  const date=$('opLogDate').value||rentalToday(),period=$('opLogPeriod').value;
  const start=new Date(date+'T00:00:00Z');
  if(period==='week') start.setUTCDate(start.getUTCDate()-((start.getUTCDay()+6)%7));
  if(period==='month') start.setUTCDate(1);
  const end=new Date(start);if(period==='month') end.setUTCMonth(end.getUTCMonth()+1);else end.setUTCDate(end.getUTCDate()+(period==='week'?7:1));
  const day=String(value||'').slice(0,10);return day>=start.toISOString().slice(0,10)&&day<end.toISOString().slice(0,10);
}
async function refreshReports() {
  try {
    const [courts,paddles]=await Promise.all([api('court_rentals.php'),api('paddle_rentals.php')]);
    if(!courts.ok||!paddles.ok) throw new Error('Could not load rental sales.');
    CR_BOOKINGS=courts.rows||[];PR_RENTALS=paddles.rows||[];
    await opLoadLog();renderSales();
  } catch(error) { opError(error.message); }
}
function renderSales() {
  salesEntries=[...CR_BOOKINGS.filter(b=>b.status!=='Cancelled'&&reportDateMatches(b.rental_date)).map(b=>({date:b.rental_date,source:'Court Rental',customer:b.customer,ref:'Court #'+b.id,amount:Number(b.amount)})),...PR_RENTALS.filter(r=>reportDateMatches(r.created_at)).map(r=>({date:String(r.created_at).slice(0,10),source:'Paddle Rental',customer:r.customer,ref:'Rental #'+r.id,amount:Number(r.amount)})),...opLogEntries.filter(e=>e.payment_status==='paid'&&reportDateMatches(e.registered_at)).map(e=>({date:String(e.registered_at).slice(0,10),source:'Open Play',customer:e.player_name,ref:'Open Play #'+e.id,amount:Number(e.amount)}))].sort((a,b)=>b.date.localeCompare(a.date));
  
  const totals = {
    'Court Rental': salesEntries.filter(e=>e.source==='Court Rental').reduce((sum,e)=>sum+e.amount,0),
    'Paddle Rental': salesEntries.filter(e=>e.source==='Paddle Rental').reduce((sum,e)=>sum+e.amount,0),
    'Open Play': salesEntries.filter(e=>e.source==='Open Play').reduce((sum,e)=>sum+e.amount,0),
    'Total': salesEntries.reduce((sum,e)=>sum+e.amount,0)
  };
  
  $('salesSummary').innerHTML=[
    { label: 'Total Sales', val: totals['Total'], color: 'green', icon: '💰' },
    { label: 'Court Rentals', val: totals['Court Rental'], color: 'blue', icon: '🏟️' },
    { label: 'Paddle Rentals', val: totals['Paddle Rental'], color: 'orange', icon: '🏸' },
    { label: 'Open Play', val: totals['Open Play'], color: 'gray', icon: '▶️' }
  ].map(s=>`<div class="kpi ${s.color}"><div><div class="kpi-label">${s.icon} ${s.label}</div><div class="kpi-value">${rentalMoney(s.val)}</div></div></div>`).join('');
  
  const chartBox = $('salesChartContent');
  if (chartBox) {
    const maxVal = totals['Total'] || 1;
    const crPct = Math.round((totals['Court Rental'] / maxVal) * 100);
    const prPct = Math.round((totals['Paddle Rental'] / maxVal) * 100);
    const opPct = Math.round((totals['Open Play'] / maxVal) * 100);

    chartBox.innerHTML = `
      <div style="margin-bottom:8px;">
        <div style="height:22px;display:flex;border-radius:8px;overflow:hidden;background:rgba(0,0,0,0.06);margin-bottom:12px;">
          <div style="width:${crPct}%;background:#3b82f6;transition:width 0.4s;" title="Court Rentals: ${crPct}%"></div>
          <div style="width:${prPct}%;background:#f59e0b;transition:width 0.4s;" title="Paddle Rentals: ${prPct}%"></div>
          <div style="width:${opPct}%;background:#10b981;transition:width 0.4s;" title="Open Play: ${opPct}%"></div>
        </div>
        
        <div class="sales-bar-row">
          <div class="sales-bar-label"><span style="color:#3b82f6;">●</span> Court Rentals</div>
          <div class="sales-bar-track"><div class="sales-bar-fill" style="width:${crPct}%;background:#3b82f6;">${crPct > 6 ? crPct + '%' : ''}</div></div>
          <div class="sales-bar-val">${rentalMoney(totals['Court Rental'])}</div>
        </div>
        <div class="sales-bar-row">
          <div class="sales-bar-label"><span style="color:#f59e0b;">●</span> Paddle Rentals</div>
          <div class="sales-bar-track"><div class="sales-bar-fill" style="width:${prPct}%;background:#f59e0b;">${prPct > 6 ? prPct + '%' : ''}</div></div>
          <div class="sales-bar-val">${rentalMoney(totals['Paddle Rental'])}</div>
        </div>
        <div class="sales-bar-row">
          <div class="sales-bar-label"><span style="color:#10b981;">●</span> Open Play</div>
          <div class="sales-bar-track"><div class="sales-bar-fill" style="width:${opPct}%;background:#10b981;">${opPct > 6 ? opPct + '%' : ''}</div></div>
          <div class="sales-bar-val">${rentalMoney(totals['Open Play'])}</div>
        </div>
      </div>
    `;
  }

  const selected=$('salesSource').value;
  $('salesRows').innerHTML=salesEntries.filter(e=>!selected||e.source===selected).map(e=>`<tr><td>${opEscape(e.date)}</td><td>${e.source}</td><td>${opEscape(e.customer)}</td><td>${e.ref}</td><td>${rentalMoney(e.amount)}</td></tr>`).join('')||'<tr><td colspan="5">No sales for this period.</td></tr>';
}
function exportSales() {
  const selected=$('salesSource').value;
  const rows=[['Date','Source','Customer','Reference','Amount'],...salesEntries.filter(e=>!selected||e.source===selected).map(e=>[e.date,e.source,e.customer,e.ref,e.amount.toFixed(2)])];
  const csv=rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='sales-'+$('opLogPeriod').value+'-'+$('opLogDate').value+'.csv';a.click();URL.revokeObjectURL(url);
}
