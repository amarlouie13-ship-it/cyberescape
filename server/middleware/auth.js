import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

function logAuthPhase(traceId, phase, details = {}) {
  // eslint-disable-next-line no-console
  console.info(`[auth:${traceId}] ${phase}`, details);
}

function inferRoleFromUser(user) {
  const metadataRole = String(user?.user_metadata?.role ?? user?.app_metadata?.role ?? '').toLowerCase();
  if (['admin', 'teacher', 'student'].includes(metadataRole)) {
    return metadataRole;
  }

  const emailPrefix = String(user?.email ?? '').toLowerCase().split('@')[0];
  if (['admin', 'teacher', 'student'].includes(emailPrefix)) {
    return emailPrefix;
  }

  return null;
}

function buildFallbackUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    full_name: String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '').trim(),
    email: String(user?.email ?? '').trim(),
    username: String(user?.user_metadata?.username ?? '').trim() || String(user?.email ?? '').split('@')[0],
    role: inferRoleFromUser(user),
    status: 'active',
  };
}

async function syncFallbackProfile(user) {
  const fallbackUser = buildFallbackUser(user);

  if (!fallbackUser?.role || fallbackUser.role !== 'admin' || !supabaseAdmin) {
    return fallbackUser;
  }

  const profile = {
    id: fallbackUser.id,
    full_name: fallbackUser.full_name || 'CyberEscape Admin',
    email: fallbackUser.email || 'admin@cyberescape.local',
    username: fallbackUser.username || 'admin',
    role: 'admin',
    status: 'active',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from('profiles').upsert(profile, { onConflict: 'id' });
  if (error) {
    return fallbackUser;
  }

  return profile;
}

export function requireAuth(req, res, next) {
  const traceId = String(req.headers['x-request-id'] ?? '').trim() || Math.random().toString(36).slice(2, 10);
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token || !supabaseAuth || !supabaseAdmin) {
    logAuthPhase(traceId, 'missing_bearer_or_config', {
      hasBearer: scheme?.toLowerCase() === 'bearer',
      hasToken: Boolean(token),
      hasSupabaseAuth: Boolean(supabaseAuth),
      hasSupabaseAdmin: Boolean(supabaseAdmin),
    });
    return res.status(401).json({ message: 'Your session has expired.' });
  }

  logAuthPhase(traceId, 'validating_token');
  supabaseAuth.auth
    .getUser(token)
    .then(({ data, error }) => {
      if (error || !data?.user?.id) {
        logAuthPhase(traceId, 'token_validation_failed', {
          message: error?.message,
          code: error?.code,
        });
        return res.status(401).json({ message: 'Your session has expired.' });
      }

      logAuthPhase(traceId, 'token_valid', { userId: data.user.id });
      return supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, username, role, status')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: profile, error: profileError }) => {
          if (profileError) {
            logAuthPhase(traceId, 'profile_lookup_failed', {
              message: profileError.message,
              code: profileError.code,
            });
            return res.status(401).json({ message: 'Your session has expired.' });
          }

          if (profile) {
            logAuthPhase(traceId, 'auth_success', {
              userId: profile.id,
              role: profile.role,
              source: 'profiles',
            });
            req.user = profile;
            return next();
          }

          return syncFallbackProfile(data.user).then((resolvedUser) => {
            if (!resolvedUser?.role) {
              logAuthPhase(traceId, 'role_resolution_failed', { userId: data.user.id });
              return res.status(401).json({ message: 'Your session has expired.' });
            }

            logAuthPhase(traceId, 'auth_success', {
              userId: resolvedUser.id,
              role: resolvedUser.role,
              source: 'fallback',
            });
            req.user = resolvedUser;
            return next();
          });
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
