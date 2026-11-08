import { currentUser, setCurrentUser } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query || {};
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }

  const action = query.action || '';

  if (action === 'me') {
    return res.status(200).json({ ok: true, user: currentUser });
  }

  if (action === 'login' || action === 'signup') {
    const user = {
      id: 1,
      email: body.email || 'admin@pickleball.local',
      name: (body.email ? body.email.split('@')[0] : 'Admin'),
      role: 'Administrator'
    };
    setCurrentUser(user);
    return res.status(200).json({ ok: true, user });
  }

  if (action === 'logout') {
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
