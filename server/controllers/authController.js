import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : null;
}

export async function login(_req, res) {
  return res.status(410).json({
    message: 'Use Supabase Authentication in the frontend. This endpoint is deprecated.',
  });
}

export async function logout(_req, res) {
  return res.json({ message: 'Logout is handled by Supabase Auth on the client.' });
}

export async function me(req, res) {
  if (!supabaseAuth || !supabaseAdmin) {
    return res.status(500).json({ message: 'Authentication service is not configured.' });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
  if (userError || !userData?.user?.id) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, username, role, status')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !profile) {
    return res.status(404).json({ message: 'Profile not found.' });
  }

  return res.json({ user: profile });
}
