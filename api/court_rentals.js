import { courtRentals } from './_db.js';

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
  const todayStr = new Date().toISOString().slice(0, 10);

  if (method === 'GET') {
    return res.status(200).json({ ok: true, rows: courtRentals });
  }

  if (method === 'POST') {
    const newId = courtRentals.length ? Math.max(...courtRentals.map(r => r.id)) + 1 : 1;
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
    courtRentals.unshift(newRental);
    return res.status(200).json({ ok: true, id: newId });
  }

  if (method === 'PUT') {
    const id = Number(query.id || body.id);
    const r = courtRentals.find(x => x.id === id);
    if (r && body.status) {
      r.status = body.status;
    }
    return res.status(200).json({ ok: true });
  }

  if (method === 'DELETE') {
    const id = Number(query.id || body.id);
    const idx = courtRentals.findIndex(x => x.id === id);
    if (idx !== -1) courtRentals.splice(idx, 1);
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true, rows: courtRentals });
}
