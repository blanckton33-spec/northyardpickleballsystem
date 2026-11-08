import { products } from './_db.js';

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
      const p = products.find(x => x.id === id);
      return res.status(200).json({ ok: true, product: p });
    }
    return res.status(200).json({ ok: true, rows: products, products });
  }

  if (method === 'POST') {
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({
      id: newId,
      name: body.name || '',
      category: body.category || 'Paddle',
      stock: Number(body.stock || 0),
      reorder_level: Number(body.reorder || 5),
      price: Number(body.price || 0),
      status: 'In Stock'
    });
    return res.status(200).json({ ok: true, id: newId });
  }

  if (method === 'PUT') {
    const id = Number(body.id || query.id);
    const item = products.find(p => p.id === id);
    if (item) {
      if (body.name) item.name = body.name;
      if (body.category) item.category = body.category;
      if (body.stock !== undefined) item.stock = Number(body.stock);
      if (body.reorder !== undefined) item.reorder_level = Number(body.reorder);
      if (body.price !== undefined) item.price = Number(body.price);
    }
    return res.status(200).json({ ok: true });
  }

  if (method === 'DELETE') {
    const id = Number(query.id || body.id);
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) products.splice(idx, 1);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
