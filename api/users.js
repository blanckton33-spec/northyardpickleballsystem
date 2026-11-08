import { users } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const method = req.method;
  const query = req.query || {};
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }

  if (method === 'GET') {
    const id = Number(query.id);
    if (id) {
      const user = users.find(u => u.id === id);
      return res.status(200).json({ ok: true, user, rows: user ? [user] : [] });
    }
    return res.status(200).json({ ok: true, rows: users, users });
  }

  if (method === 'POST') {
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const role = body.role || 'Staff';
    const status = body.status || 'Active';
    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'Name and email are required' });
    }
    const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newUser = { id: newId, name, email, role, status, created: nowStr, created_at: nowStr };
    users.push(newUser);
    return res.status(200).json({ ok: true, id: newId });
  }

  if (method === 'PUT') {
    const id = Number(body.id || query.id);
    const item = users.find(u => u.id === id);
    if (!item) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    if (body.name) item.name = String(body.name).trim();
    if (body.email) item.email = String(body.email).trim();
    if (body.role) item.role = body.role;
    if (body.status) item.status = body.status;
    return res.status(200).json({ ok: true });
  }

  if (method === 'DELETE') {
    const id = Number(query.id || body.id);
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users.splice(idx, 1);
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
