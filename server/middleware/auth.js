import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token || !supabaseAuth || !supabaseAdmin) {
    return res.status(401).json({ message: 'Your session has expired.' });
  }

  supabaseAuth.auth
    .getUser(token)
    .then(({ data, error }) => {
      if (error || !data?.user?.id) {
        return res.status(401).json({ message: 'Your session has expired.' });
      }

      return supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, username, role, status')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile, error: profileError }) => {
          if (profileError || !profile) {
            return res.status(401).json({ message: 'Your session has expired.' });
          }

          req.user = profile;
          return next();
        });
    })
    .catch(() => res.status(401).json({ message: 'Your session has expired.' }));
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    next();
  };
}

export function getSessionStore() {
  return { user: null };
}
