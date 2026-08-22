import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';

const allowedUserRoles = new Set(['admin', 'teacher', 'student']);

function normalizeUsername(value) {
  return String(value ?? '').trim().toLowerCase();
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());
}

function buildInternalEmail(username) {
  return `${normalizeUsername(username)}@cyberescape.local`;
}

function buildStudentNumber() {
  return `STU-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function buildEmployeeNumber() {
  return `TCH-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function logAccountPhase(traceId, phase, details = {}) {
  // Keep logs structured so we can follow account creation step-by-step.
  // eslint-disable-next-line no-console
  console.info(`[createUser:${traceId}] ${phase}`, details);
}

function sendSupabaseError(res, status, message, traceId, error) {
  return res.status(status).json({
    message,
    code: error?.code ?? 'supabase_error',
    traceId,
  });
}

export async function listRooms(_req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.json({ rooms: [] });
    }
    const { data, error } = await supabaseAdmin.from('rooms').select('*').order('order_number', { ascending: true });
    if (error) throw error;
    res.json({ rooms: data ?? [] });
  } catch (error) {
    next(error);
  }
}

export async function createRoom(req, res, next) {
  try {
    const payload = req.body ?? {};
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { data, error } = await supabaseAdmin.from('rooms').insert(payload).select('*').single();
    if (error) throw error;
    res.status(201).json({ room: data });
  } catch (error) {
    next(error);
  }
}

export async function updateRoom(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { data, error } = await supabaseAdmin.from('rooms').update(req.body ?? {}).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json({ room: data });
  } catch (error) {
    next(error);
  }
}

export async function deleteRoom(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { error } = await supabaseAdmin.from('rooms').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Room deleted.' });
  } catch (error) {
    next(error);
  }
}

export async function listPuzzles(_req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.json({ puzzles: [] });
    }
    const { data, error } = await supabaseAdmin.from('puzzles').select('*, rooms:room_id(room_number,title)').order('order_number', { ascending: true });
    if (error) throw error;
    res.json({ puzzles: data ?? [] });
  } catch (error) {
    next(error);
  }
}

export async function createPuzzle(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { data, error } = await supabaseAdmin.from('puzzles').insert(req.body ?? {}).select('*').single();
    if (error) throw error;
    res.status(201).json({ puzzle: data });
  } catch (error) {
    next(error);
  }
}

export async function updatePuzzle(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { data, error } = await supabaseAdmin.from('puzzles').update(req.body ?? {}).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json({ puzzle: data });
  } catch (error) {
    next(error);
  }
}

export async function deletePuzzle(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { error } = await supabaseAdmin.from('puzzles').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Puzzle deleted.' });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  const traceId = randomUUID().slice(0, 8);
  try {
    if (!supabaseAdmin) {
      logAccountPhase(traceId, 'config_missing');
      return res.status(501).json({ message: 'Supabase not configured.' });
    }

    const emailInput = normalizeEmail(req.body?.email);
    const username = normalizeUsername(req.body?.username);
    const password = String(req.body?.password ?? '');
    const confirmPassword = String(req.body?.confirmPassword ?? '');
    const role = String(req.body?.role ?? '').toLowerCase();
    const email = isValidEmail(emailInput) ? emailInput : buildInternalEmail(username);

    logAccountPhase(traceId, 'request_received', {
      username,
      role,
      email,
      hasPassword: Boolean(password),
      hasConfirmPassword: Boolean(confirmPassword),
    });

    if (!username || !password || !confirmPassword || !role) {
      logAccountPhase(traceId, 'validation_failed', { reason: 'missing_fields' });
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!allowedUserRoles.has(role)) {
      logAccountPhase(traceId, 'validation_failed', { reason: 'invalid_role', role });
      return res.status(400).json({ message: 'Invalid role.' });
    }

    if (password !== confirmPassword) {
      logAccountPhase(traceId, 'validation_failed', { reason: 'password_mismatch' });
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    logAccountPhase(traceId, 'checking_existing_profiles');
    const [{ data: existingUsername }, { data: existingEmail }] = await Promise.all([
      supabaseAdmin.from('profiles').select('id').eq('username', username).maybeSingle(),
      supabaseAdmin.from('profiles').select('id').eq('email', email).maybeSingle(),
    ]);

    if (existingUsername || existingEmail) {
      logAccountPhase(traceId, 'validation_failed', {
        reason: 'duplicate_profile',
        existingUsername: Boolean(existingUsername),
        existingEmail: Boolean(existingEmail),
      });
      return res.status(409).json({ message: 'Username already exists.' });
    }

    logAccountPhase(traceId, 'creating_auth_user');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        email,
        role,
      },
    });

    if (authError) {
      logAccountPhase(traceId, 'auth_create_failed', {
        message: authError.message,
        code: authError.code,
        status: authError.status,
      });
      const message = authError.message?.toLowerCase() ?? '';
      if (message.includes('already registered')) {
        return res.status(409).json({ message: 'Email already exists.' });
      }
      if (message.includes('invalid') && message.includes('email')) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
      }
      if (authError.status === 404) {
        return sendSupabaseError(
          res,
          502,
          'Supabase auth endpoint was not found. Check SUPABASE_URL and service role configuration.',
          traceId,
          authError,
        );
      }
      if (authError.status === 401 || authError.status === 403) {
        return sendSupabaseError(
          res,
          502,
          'Supabase rejected the admin credentials. Check SUPABASE_SERVICE_ROLE_KEY.',
          traceId,
          authError,
        );
      }
      return sendSupabaseError(res, 502, 'Failed to create the auth user in Supabase.', traceId, authError);
    }

    const userId = authData.user.id;
    logAccountPhase(traceId, 'auth_create_succeeded', { userId });

    logAccountPhase(traceId, 'upserting_profile');
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: username,
      email,
      username,
      role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (profileError) {
      logAccountPhase(traceId, 'profile_upsert_failed', {
        message: profileError.message,
        code: profileError.code,
      });
      throw profileError;
    }

    if (role === 'student') {
      logAccountPhase(traceId, 'upserting_student_row');
      const { error } = await supabaseAdmin.from('students').upsert({
        profile_id: userId,
        student_number: buildStudentNumber(),
      }, { onConflict: 'profile_id' });
      if (error) {
        logAccountPhase(traceId, 'student_upsert_failed', {
          message: error.message,
          code: error.code,
        });
        throw error;
      }
    }

    if (role === 'teacher') {
      logAccountPhase(traceId, 'upserting_teacher_row');
      const { error } = await supabaseAdmin.from('teachers').upsert({
        profile_id: userId,
        employee_number: buildEmployeeNumber(),
      }, { onConflict: 'profile_id' });
      if (error) {
        logAccountPhase(traceId, 'teacher_upsert_failed', {
          message: error.message,
          code: error.code,
        });
        throw error;
      }
    }

    logAccountPhase(traceId, 'create_user_completed');
    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    logAccountPhase(traceId, 'unhandled_error', {
      message: error?.message,
      code: error?.code,
      status: error?.status,
    });
    return res.status(500).json({
      message: error?.message || 'Unexpected backend error while creating user.',
      code: error?.code || 'internal_error',
      traceId,
    });
  }
}
