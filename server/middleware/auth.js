import { supabaseAdmin } from '../config/supabase.js';

const mockSession = globalThis.__cyberescapeSession ?? { user: null };
globalThis.__cyberescapeSession = mockSession;

export function requireAuth(req, res, next) {
  const user = mockSession.user;
  if (!user) {
    return res.status(401).json({ message: 'Your session has expired.' });
  }
  req.user = user;
  next();
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
  return mockSession;
}

