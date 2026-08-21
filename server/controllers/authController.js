import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';
import { getSessionStore } from '../middleware/auth.js';

export async function login(req, res) {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username or password is required.' });
  }

  const demoModeEnabled = process.env.CYBERESCAPE_DEMO_LOGIN === 'true';
  const demoPassword = process.env.CYBERESCAPE_DEMO_PASSWORD || 'CyberEscape123!';

  if (supabaseAdmin && supabaseAuth) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, username, role, status')
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .maybeSingle();

    if (!profile || profile.status !== 'active') {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const { error: authError } = await supabaseAuth.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (authError) {
      if (demoModeEnabled && profile.role === 'admin' && password === demoPassword) {
        getSessionStore().user = profile;
        return res.json({ message: 'Login successful.' });
      }
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    getSessionStore().user = profile;
    return res.json({ message: 'Login successful.' });
  }

  const demoRole = identifier.toLowerCase().includes('admin')
    ? 'admin'
    : identifier.toLowerCase().includes('teacher')
      ? 'teacher'
      : 'student';

  getSessionStore().user = {
    id: `demo-${demoRole}`,
    full_name: `Cyber ${demoRole}`,
    email: `${demoRole}@cyberescape.local`,
    username: demoRole,
    role: demoRole,
    status: 'active',
  };
  return res.json({ message: 'Login successful.' });
}

export async function logout(_req, res) {
  getSessionStore().user = null;
  res.json({ message: 'Logged out.' });
}

export async function me(_req, res) {
  const user = getSessionStore().user;
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  return res.json({ user });
}
