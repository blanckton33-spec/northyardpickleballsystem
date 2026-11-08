import { paddleRentals } from './_db.js';

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
  const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (method === 'GET') {
    return res.status(200).json({ ok: true, rows: paddleRentals, stock: { paddles: 20, balls: 50 } });
  }

  if (method === 'POST') {
    const newId = paddleRentals.length ? Math.max(...paddleRentals.map(r => r.id)) + 1 : 1;
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
    paddleRentals.unshift(newRental);
    return res.status(200).json({ ok: true, id: newId });
  }

  if (method === 'PUT') {
    const id = Number(query.id || body.id);
    const r = paddleRentals.find(x => x.id === id);
    if (r) {
      r.status = 'Returned';
      r.returned_at = todayStr + ' ' + nowTimeStr;
    }
    return res.status(200).json({ ok: true });
  }

  if (method === 'DELETE') {
    const id = Number(query.id || body.id);
    const idx = paddleRentals.findIndex(x => x.id === id);
    if (idx !== -1) paddleRentals.splice(idx, 1);
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true, rows: paddleRentals });
}
