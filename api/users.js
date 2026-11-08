import { users, products, stockIn, stockOut, suppliers } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.url || '';
  if (url.includes('products')) return res.status(200).json({ ok: true, products });
  if (url.includes('stock')) return res.status(200).json({ ok: true, rows: stockIn, stockIn, stockOut });
  if (url.includes('suppliers')) return res.status(200).json({ ok: true, suppliers });
  return res.status(200).json({ ok: true, users });
}
