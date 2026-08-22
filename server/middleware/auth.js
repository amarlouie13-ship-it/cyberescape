import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

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
  const role = inferRoleFromUser(user);
  if (!user || !role) {
    return null;
  }

  return {
    id: user.id,
    full_name: String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '').trim() || 'CyberEscape Admin',
    email: String(user?.email ?? '').trim(),
    username: String(user?.user_metadata?.username ?? '').trim() || String(user?.email ?? '').split('@')[0],
    role,
    status: 'active',
  };
}

async function ensureProfile(user) {
  const fallback = buildFallbackProfile(user);
  if (!fallback || !supabaseAdmin) {
    return null;
  }

  const { data: existingProfile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, username, role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return null;
  }

  if (existingProfile) {
    if (existingProfile.role === 'admin') {
      return existingProfile;
    }

    if (fallback.role === 'admin') {
      const { data: repairedProfile, error: repairError } = await supabaseAdmin
        .from('profiles')
        .upsert(
          {
            id: existingProfile.id,
            full_name: existingProfile.full_name || fallback.full_name,
            email: existingProfile.email || fallback.email,
            username: existingProfile.username || fallback.username,
            role: 'admin',
            status: existingProfile.status || 'active',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        )
        .select('id, full_name, email, username, role, status')
        .single();

      if (!repairError && repairedProfile) {
        return repairedProfile;
      }
    }

    return existingProfile;
  }

  const { data: createdProfile, error: upsertError } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: fallback.id,
        full_name: fallback.full_name,
        email: fallback.email,
        username: fallback.username,
        role: fallback.role,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select('id, full_name, email, username, role, status')
    .single();

  if (upsertError) {
    return null;
  }

  return createdProfile ?? fallback;
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || `Bearer ${req.headers['x-access-token'] || ''}`;
  const [scheme, token] = header.split(' ');

  if (!supabaseAuth || !supabaseAdmin) {
    return res.status(500).json({
      message: 'Supabase auth is not configured on the backend.',
      code: 'supabase_auth_not_configured',
    });
  }

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({
      message: 'Authentication token is missing or invalid.',
      code: 'missing_bearer_or_config',
    });
  }

  supabaseAuth.auth
    .getUser(token)
    .then(async ({ data, error }) => {
      if (error || !data?.user?.id) {
        return res.status(401).json({
          message: 'Supabase session token is expired or invalid.',
          code: 'token_validation_failed',
        });
      }

      const profile = await ensureProfile(data.user);
      if (!profile) {
        return res.status(401).json({
          message: 'Authenticated user profile could not be found.',
          code: 'profile_not_found',
        });
      }

      if (profile.role !== 'admin') {
        return res.status(403).json({
          message: 'Admin role is required.',
          code: 'insufficient_role',
        });
      }

      req.user = profile;
      return next();
    })
    .catch(() => {
      res.status(401).json({
        message: 'Authentication failed while validating the session.',
        code: 'auth_exception',
      });
    });
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
