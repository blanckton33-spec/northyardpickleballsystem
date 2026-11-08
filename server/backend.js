const endpoints = new Set(['auth', 'users', 'open_play', 'court_rentals', 'paddle_rentals', 'products', 'stock', 'suppliers']);
export function backendHandler(endpoint) {
  if (!endpoints.has(endpoint)) throw new Error('Unknown API');
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store');
    const fail = (status, error) => res.status(status).json({ ok: false, error });
    const origin = process.env.PHP_BACKEND_ORIGIN;
    if (!origin) return fail(503, 'Backend is not connected. Configure PHP_BACKEND_ORIGIN with the compatible PHP/MySQL host.');
    let target;
    try {
      const base = new URL(origin);
      if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error();
      if (base.host === req.headers.host) throw new Error();
      target = new URL(`${base.pathname.replace(/\/$/, '')}/api/${endpoint}.php`, base.origin);
      target.search = new URL(req.url, 'https://local.invalid').search;
    } catch { return fail(503, 'Backend URL configuration is invalid.'); }
    const method = req.method || 'GET';
    if (!['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].includes(method)) return fail(405, 'Method not allowed');
    if (method === 'OPTIONS') return res.status(204).end();
    const headers = { Accept: 'application/json' };
    if (req.headers.cookie) headers.Cookie = req.headers.cookie;
    let body;
    if (!['GET', 'HEAD'].includes(method) && req.body !== undefined) {
      headers['Content-Type'] = req.headers['content-type'] || 'application/json';
      body = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body);
    }
    try {
      const upstream = await fetch(target, { method, headers, body, redirect: 'manual', signal: AbortSignal.timeout(20000) });
      if (!(upstream.headers.get('content-type') || '').includes('application/json')) {
        return fail(502, 'Backend did not return JSON. Verify the PHP host permits server-to-server API access; InfinityFree free hosting does not.');
      }
      const cookies = upstream.headers.getSetCookie();
      if (cookies.length) res.setHeader('Set-Cookie', cookies.map(cookie => cookie.replace(/;\s*Domain=[^;]+/gi, '').replace(/;\s*Path=[^;]+/gi, '; Path=/')));
      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    } catch { return fail(502, 'Could not reach the database backend. Please retry or check the PHP host.'); }
  };
}
