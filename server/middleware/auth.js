import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

function logAuthPhase(traceId, phase, details = {}) {
  // eslint-disable-next-line no-console
  console.info(`[auth:${traceId}] ${phase}`, details);
}

function sendAuthError(res, status, message, code, traceId, phase, details = {}) {
  logAuthPhase(traceId, phase, details);
  return res.status(status).json({ message, code, traceId });
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

function buildFallbackProfile(user) {
  if (!user) {
    return null;
  }

  const role = inferRoleFromUser(user);
  return {
    id: user.id,
    full_name: String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '').trim(),
    email: String(user?.email ?? '').trim(),
    username: String(user?.user_metadata?.username ?? '').trim() || String(user?.email ?? '').split('@')[0],
    role,
    status: 'active',
  };
}

async function upsertMissingAdminProfile(profile) {
  if (!profile?.id || profile.role !== 'admin' || !supabaseAdmin) {
    return profile;
  }

  const payload = {
    id: profile.id,
    full_name: profile.full_name || 'CyberEscape Admin',
    email: profile.email || 'admin@cyberescape.local',
    username: profile.username || 'admin',
    role: 'admin',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) {
    logAuthPhase('admin-sync', 'admin_profile_upsert_failed', { message: error.message, code: error.code });
  }

  return payload;
}

export function requireAuth(req, res, next) {
  const traceId = String(req.headers['x-request-id'] ?? '').trim() || Math.random().toString(36).slice(2, 10);
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token || !supabaseAuth || !supabaseAdmin) {
    return sendAuthError(res, 401, 'Authentication token is missing or invalid.', 'missing_bearer_or_config', traceId, 'missing_bearer_or_config', {
      hasBearer: scheme?.toLowerCase() === 'bearer',
      hasToken: Boolean(token),
      hasSupabaseAuth: Boolean(supabaseAuth),
      hasSupabaseAdmin: Boolean(supabaseAdmin),
    });
  }

  logAuthPhase(traceId, 'validating_token');
  supabaseAuth.auth
    .getUser(token)
    .then(({ data, error }) => {
      if (error || !data?.user?.id) {
        return sendAuthError(res, 401, 'Supabase session token is expired or invalid.', 'token_validation_failed', traceId, 'token_validation_failed', {
          message: error?.message,
          code: error?.code,
        });
      }

      logAuthPhase(traceId, 'token_valid', { userId: data.user.id });
      return supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, username, role, status')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: profile, error: profileError }) => {
          if (profileError) {
            const fallbackProfile = buildFallbackProfile(data.user);
            if (!fallbackProfile?.role) {
              return sendAuthError(res, 401, 'Authenticated user profile could not be loaded.', 'profile_lookup_failed', traceId, 'profile_lookup_failed', {
                message: profileError.message,
                code: profileError.code,
              });
            }

            if (fallbackProfile.role !== 'admin') {
              return sendAuthError(res, 403, 'Admin role is required.', 'insufficient_role', traceId, 'insufficient_role', {
                userId: data.user.id,
                role: fallbackProfile.role,
                profileLookupError: profileError.message,
              });
            }

            return upsertMissingAdminProfile(fallbackProfile).then((resolvedProfile) => {
              logAuthPhase(traceId, 'auth_success', {
                userId: resolvedProfile.id,
                role: resolvedProfile.role,
                source: 'fallback_after_profile_error',
              });
              req.user = resolvedProfile;
              return next();
            });
          }

          if (!profile) {
            const fallbackProfile = buildFallbackProfile(data.user);
            if (!fallbackProfile?.role) {
              return sendAuthError(res, 401, 'Authenticated user profile could not be found.', 'profile_not_found', traceId, 'profile_not_found', {
                userId: data.user.id,
              });
            }

            if (fallbackProfile.role !== 'admin') {
              return sendAuthError(res, 403, 'Admin role is required.', 'insufficient_role', traceId, 'insufficient_role', {
                userId: data.user.id,
                role: fallbackProfile.role,
              });
            }

            return upsertMissingAdminProfile(fallbackProfile).then((resolvedProfile) => {
              logAuthPhase(traceId, 'auth_success', {
                userId: resolvedProfile.id,
                role: resolvedProfile.role,
                source: 'fallback_profile',
              });
              req.user = resolvedProfile;
              return next();
            });
          }

          if (profile.role !== 'admin') {
            return sendAuthError(res, 403, 'Admin role is required.', 'insufficient_role', traceId, 'insufficient_role', {
              userId: data.user.id,
              role: profile.role,
            });
          }

          logAuthPhase(traceId, 'auth_success', {
            userId: profile.id,
            role: profile.role,
            source: 'profiles',
          });
          req.user = profile;
          return next();
        });
    })
    .catch((error) => sendAuthError(res, 401, 'Authentication failed while validating the session.', 'auth_exception', traceId, 'auth_exception', {
      message: error?.message,
    }));
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({
        message: `Role ${req.user?.role || 'unknown'} is not allowed.`,
        code: 'insufficient_role',
      });
    }
    next();
  };
}

export function getSessionStore() {
  return { user: null };
}
