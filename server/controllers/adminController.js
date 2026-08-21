import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';

const allowedUserRoles = new Set(['admin', 'teacher', 'student']);

function normalizeUsername(value) {
  return String(value ?? '').trim().toLowerCase();
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

function buildStudentNumber() {
  return `STU-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function buildEmployeeNumber() {
  return `TCH-${randomUUID().slice(0, 8).toUpperCase()}`;
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
  try {
    if (!supabaseAdmin) {
      return res.status(501).json({ message: 'Supabase not configured.' });
    }

    const email = normalizeEmail(req.body?.email);
    const username = normalizeUsername(req.body?.username);
    const password = String(req.body?.password ?? '');
    const confirmPassword = String(req.body?.confirmPassword ?? '');
    const role = String(req.body?.role ?? '').toLowerCase();

    if (!email || !username || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!allowedUserRoles.has(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const [{ data: existingUsername }, { data: existingEmail }] = await Promise.all([
      supabaseAdmin.from('profiles').select('id').eq('username', username).maybeSingle(),
      supabaseAdmin.from('profiles').select('id').eq('email', email).maybeSingle(),
    ]);

    if (existingUsername || existingEmail) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

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
      if (authError.message?.toLowerCase().includes('already registered')) {
        return res.status(409).json({ message: 'Username already exists.' });
      }
      throw authError;
    }

    const userId = authData.user.id;

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
      throw profileError;
    }

    if (role === 'student') {
      const { error } = await supabaseAdmin.from('students').upsert({
        profile_id: userId,
        student_number: buildStudentNumber(),
      }, { onConflict: 'profile_id' });
      if (error) throw error;
    }

    if (role === 'teacher') {
      const { error } = await supabaseAdmin.from('teachers').upsert({
        profile_id: userId,
        employee_number: buildEmployeeNumber(),
      }, { onConflict: 'profile_id' });
      if (error) throw error;
    }

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    next(error);
  }
}
