import { suppliers } from './_db.js';

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
    return res.status(200).json({ ok: true, rows: suppliers, suppliers });
  }

  if (method === 'POST') {
    const newId = suppliers.length ? Math.max(...suppliers.map(s => s.id)) + 1 : 1;
    suppliers.push({
      id: newId,
      name: body.name || '',
      contact_person: body.contact || '',
      phone: body.phone || '',
      email: body.email || '',
      address: body.address || '',
      status: 'Active'
    });
    return res.status(200).json({ ok: true, id: newId });
  }

  if (method === 'PUT') {
    const id = Number(body.id || query.id);
    const item = suppliers.find(s => s.id === id);
    if (item) {
      if (body.name) item.name = body.name;
      if (body.contact) item.contact_person = body.contact;
      if (body.phone) item.phone = body.phone;
      if (body.email) item.email = body.email;
      if (body.address) item.address = body.address;
    }
    return res.status(200).json({ ok: true });
  }

  if (method === 'DELETE') {
    const id = Number(query.id || body.id);
    const idx = suppliers.findIndex(s => s.id === id);
    if (idx !== -1) suppliers.splice(idx, 1);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
