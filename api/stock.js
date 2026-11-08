import { stockIn, stockOut, products } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const method = req.method;
  const query = req.query || {};
  const type = query.type || '';
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }

  if (method === 'GET') {
    if (type === 'out') {
      return res.status(200).json({ ok: true, rows: stockOut, stockOut });
    }
    return res.status(200).json({ ok: true, rows: stockIn, stockIn });
  }

  if (method === 'POST') {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (type === 'out') {
      const newId = stockOut.length ? Math.max(...stockOut.map(s => s.id)) + 1 : 1;
      const entry = {
        id: newId,
        product_name: body.product || '',
        qty: Number(body.qty || 1),
        reason: body.reason || '',
        issued_to: body.issuedTo || '',
        entry_date: body.date || todayStr,
        processed_by: body.by || 'Admin',
        notes: body.notes || ''
      };
      stockOut.unshift(entry);
      const prod = products.find(p => p.name === body.product);
      if (prod) prod.stock = Math.max(0, prod.stock - entry.qty);
      return res.status(200).json({ ok: true, id: newId });
    } else {
      const newId = stockIn.length ? Math.max(...stockIn.map(s => s.id)) + 1 : 1;
      const entry = {
        id: newId,
        product_name: body.product || '',
        supplier_name: body.supplier || '',
        qty: Number(body.qty || 1),
        unit_cost: Number(body.cost || 0),
        entry_date: body.date || todayStr,
        received_by: body.by || 'Admin',
        notes: body.notes || ''
      };
      stockIn.unshift(entry);
      const prod = products.find(p => p.name === body.product);
      if (prod) prod.stock += entry.qty;
      return res.status(200).json({ ok: true, id: newId });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
