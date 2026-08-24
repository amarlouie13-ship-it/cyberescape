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

function isStrongPassword(value) {
  const input = String(value ?? '');
  return input.length >= 8
    && /[A-Z]/.test(input)
    && /[a-z]/.test(input)
    && /\d/.test(input)
    && /[^A-Za-z0-9]/.test(input);
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

async function syncRoleMembership(userId, role) {
  if (!supabaseAdmin) {
    return;
  }

  if (role === 'student') {
    await supabaseAdmin.from('students').upsert(
      {
        profile_id: userId,
        student_number: buildStudentNumber(),
      },
      { onConflict: 'profile_id' },
    );
    return;
  }

  if (role === 'teacher') {
    await supabaseAdmin.from('teachers').upsert(
      {
        profile_id: userId,
        employee_number: buildEmployeeNumber(),
      },
      { onConflict: 'profile_id' },
    );
  }
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
    details: error?.message ?? null,
    traceId,
  });
}

function isUniqueViolation(error) {
  return ['23505', 'PGRST116', '409'].includes(String(error?.code ?? error?.status ?? ''));
}

export async function listRooms(_req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.json({ rooms: [] });
    }
    const { data, error } = await supabaseAdmin.from('rooms').select('*').order('order_number', { ascending: true });
    if (error) throw error;
    const rooms = (data ?? []).map((room, index) => ({
      ...room,
      unlock_requirement: index === 0 ? 'None' : `Room ${index}`,
      display_label: `${String(room.room_number).padStart(2, '0')} — ${room.title}`,
    }));
    res.json({ rooms });
  } catch (error) {
    next(error);
  }
}

function normalizeRoomPayload(payload = {}) {
  const roomNumber = Number(payload.room_number);
  const orderNumber = Number(payload.order_number ?? payload.room_number);
  return {
    room_number: roomNumber,
    title: String(payload.title ?? '').trim(),
    topic: String(payload.topic ?? '').trim(),
    difficulty: String(payload.difficulty ?? '').trim() || 'Easy',
    objective: String(payload.objective ?? '').trim(),
    scenario: String(payload.scenario ?? '').trim(),
    instructions: String(payload.instructions ?? '').trim(),
    time_limit_minutes: Number(payload.time_limit_minutes ?? 0),
    maximum_attempts: Number(payload.maximum_attempts ?? 3),
    hint_limit: Number(payload.hint_limit ?? 3),
    base_points: Number(payload.base_points ?? 1000),
    unlock_requirement: String(payload.unlock_requirement ?? 'None'),
    status: String(payload.status ?? 'draft').toLowerCase(),
    order_number: Number.isFinite(orderNumber) ? orderNumber : roomNumber,
  };
}

export async function createRoom(req, res, next) {
  try {
    const payload = req.body ?? {};
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const room = normalizeRoomPayload(payload);
    if (!room.room_number || !room.title) {
      return res.status(400).json({ message: 'Room number and room name are required.' });
    }
    const { data, error } = await supabaseAdmin.from('rooms').insert(room).select('*').single();
    if (error) throw error;
    res.status(201).json({ room: data });
  } catch (error) {
    next(error);
  }
}

export async function updateRoom(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const room = normalizeRoomPayload(req.body ?? {});
    const { data, error } = await supabaseAdmin.from('rooms').update(room).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json({ room: data });
  } catch (error) {
    next(error);
  }
}

export async function reorderRooms(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const rooms = Array.isArray(req.body?.rooms) ? req.body.rooms : [];
    if (!rooms.length) {
      return res.status(400).json({ message: 'Rooms payload is required.' });
    }

    const updates = rooms.map((room, index) => ({
      id: room.id,
      order_number: index + 1,
      room_number: index + 1,
      unlock_requirement: index === 0 ? 'None' : `Room ${index}`,
    }));

    const { data, error } = await supabaseAdmin.from('rooms').upsert(updates, { onConflict: 'id' }).select('*');
    if (error) throw error;
    res.json({ rooms: data ?? [] });
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

export async function listTeachers(_req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.json({ teachers: [] });
    }

    const [profilesRes, teachersRes, studentsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, full_name, email, username, role, status, created_at, last_login').eq('role', 'teacher').order('created_at', { ascending: false }),
      supabaseAdmin.from('teachers').select('profile_id'),
      supabaseAdmin.from('students').select('id'),
    ]);

    const assignedStudents = studentsRes.data?.length ?? 0;
    const teachers = (profilesRes.data ?? []).map((profile, index) => ({
      id: profile.id,
      teacher_id: `TCH-${String(index + 1).padStart(4, '0')}`,
      full_name: profile.full_name,
      email: profile.email,
      username: profile.username,
      status: profile.status,
      last_login: profile.last_login,
      created_at: profile.created_at,
      students: assignedStudents,
      role: profile.role,
    }));

    res.json({
      teachers,
      totals: {
        totalTeachers: teachers.length,
        activeTeachers: teachers.filter((teacher) => teacher.status === 'online').length,
        inactiveTeachers: teachers.filter((teacher) => teacher.status !== 'online').length,
        assignedStudents,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listStudents(_req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.json({ students: [], totals: {} });
    }

    const [profilesRes, studentsRes, sessionsRes, roomProgressRes, scoresRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, full_name, email, username, role, status, created_at, last_login').eq('role', 'student').order('created_at', { ascending: false }),
      supabaseAdmin.from('students').select('profile_id, student_number'),
      supabaseAdmin.from('game_sessions').select('student_id, status, current_room_id, last_activity, started_at, ended_at'),
      supabaseAdmin.from('room_progress').select('student_id, status, completed_at, attempts, hints_used, score, room_id'),
      supabaseAdmin.from('scores').select('student_id, score, created_at'),
    ]);

    const students = (profilesRes.data ?? []).map((profile, index) => {
      const membership = studentsRes.data?.find((row) => row.profile_id === profile.id);
      const session = sessionsRes.data?.find((row) => row.student_id === profile.id);
      const progressRows = roomProgressRes.data?.filter((row) => row.student_id === profile.id) ?? [];
      const scoreRows = scoresRes.data?.filter((row) => row.student_id === profile.id) ?? [];
      const completedRooms = progressRows.filter((row) => row.status === 'completed').length;
      const totalRooms = 8;
      const progress = Math.round((completedRooms / totalRooms) * 100);
      const totalScore = scoreRows.reduce((sum, row) => sum + Number(row.score || 0), 0);

      return {
        id: profile.id,
        student_id: membership?.student_number ?? `STD-${String(index + 1).padStart(4, '0')}`,
        full_name: profile.full_name,
        email: profile.email,
        username: profile.username,
        status: profile.status,
        game_status: session?.status === 'active' ? 'In Progress' : completedRooms >= totalRooms ? 'Completed' : 'Not Started',
        progress,
        rooms_completed: `${completedRooms}/${totalRooms}`,
        score: totalScore,
        last_activity: session?.last_activity ?? profile.last_login ?? profile.created_at,
        current_room: session?.current_room_id ? `Room ${String(session.current_room_id).match(/\d+/)?.[0] ?? ''}` : 'None',
        attempts: progressRows.reduce((sum, row) => sum + Number(row.attempts || 0), 0),
        hints_used: progressRows.reduce((sum, row) => sum + Number(row.hints_used || 0), 0),
        total_play_time: session?.started_at ? 'Active session' : '0m',
        assigned_teacher: 'Unassigned',
        class_section: 'N/A',
      };
    });

    const activeStudents = students.filter((student) => student.game_status === 'In Progress').length;
    const completedStudents = students.filter((student) => student.game_status === 'Completed').length;

    res.json({
      students,
      totals: {
        totalStudents: students.length,
        activeStudents: students.filter((student) => student.status === 'online').length,
        currentlyPlaying: activeStudents,
        completedStudents,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(_req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.json({ users: [] });
    }

    const [profilesRes, studentsRes, teachersRes, roomProgressRes, scoresRes, achievementsRes, assignmentsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, full_name, email, username, role, status, created_at, last_login').in('role', ['teacher', 'student']).order('created_at', { ascending: false }),
      supabaseAdmin.from('students').select('profile_id, student_number'),
      supabaseAdmin.from('teachers').select('profile_id, employee_number'),
      supabaseAdmin.from('room_progress').select('student_id, status, completed_at, attempts, hints_used, score, room_id'),
      supabaseAdmin.from('scores').select('student_id, score, created_at'),
      supabaseAdmin.from('student_achievements').select('student_id, earned_at, achievement_id, achievements(name)'),
      supabaseAdmin.from('teacher_student_assignments').select('*').catch(() => ({ data: [] })),
    ]);

    const users = (profilesRes.data ?? []).map((profile, index) => {
      const student = studentsRes.data?.find((row) => row.profile_id === profile.id);
      const teacher = teachersRes.data?.find((row) => row.profile_id === profile.id);
      const progressRows = roomProgressRes.data?.filter((row) => row.student_id === profile.id) ?? [];
      const scoreRows = scoresRes.data?.filter((row) => row.student_id === profile.id) ?? [];
      const achievements = (achievementsRes.data ?? []).filter((row) => row.student_id === profile.id);
      const roomsCompleted = progressRows.filter((row) => row.status === 'completed').length;
      const totalScore = scoreRows.reduce((sum, row) => sum + Number(row.score || 0), 0);

      return {
        id: profile.id,
        user_id: profile.role === 'teacher' ? teacher?.employee_number ?? `TCH-${String(index + 1).padStart(3, '0')}` : student?.student_number ?? `STD-${String(index + 1).padStart(3, '0')}`,
        full_name: profile.full_name,
        username: profile.username,
        email: profile.email,
        role: profile.role,
        status: profile.status,
        created_at: profile.created_at,
        last_login: profile.last_login,
        rooms_completed: `${roomsCompleted}/8`,
        score: totalScore,
        attempts: progressRows.reduce((sum, row) => sum + Number(row.attempts || 0), 0),
        hints_used: progressRows.reduce((sum, row) => sum + Number(row.hints_used || 0), 0),
        assigned_students: assignmentsRes.data?.filter((row) => row.teacher_id === profile.id).length ?? 0,
        achievements: achievements.length,
        current_room: progressRows.find((row) => row.status === 'in_progress')?.room_id ?? null,
      };
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { id } = req.params;
    const payload = req.body ?? {};
    const updates = {};
    if (payload.full_name != null) updates.full_name = String(payload.full_name).trim();
    if (payload.username != null) updates.username = String(payload.username).trim().toLowerCase();
    if (payload.email != null) updates.email = String(payload.email).trim().toLowerCase();
    if (payload.status != null) updates.status = String(payload.status).toLowerCase();
    const { data, error } = await supabaseAdmin.from('profiles').update(updates).eq('id', id).select('*').single();
    if (error) throw error;
    res.json({ user: data });
  } catch (error) {
    next(error);
  }
}

export async function deleteUserProgress(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { id } = req.params;
    await Promise.all([
      supabaseAdmin.from('room_progress').delete().eq('student_id', id),
      supabaseAdmin.from('puzzle_progress').delete().eq('student_id', id),
      supabaseAdmin.from('attempts').delete().eq('student_id', id),
      supabaseAdmin.from('scores').delete().eq('student_id', id),
      supabaseAdmin.from('student_achievements').delete().eq('student_id', id),
      supabaseAdmin.from('game_sessions').update({ current_room_id: null, status: 'abandoned' }).eq('student_id', id),
    ]);
    res.json({ message: 'Student progress reset.' });
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
    const status = String(req.body?.status ?? 'offline').toLowerCase();
    const fullName = String(req.body?.full_name ?? '').trim() || username;
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

    if (!isStrongPassword(password)) {
      logAccountPhase(traceId, 'validation_failed', { reason: 'weak_password' });
      return res.status(400).json({ message: 'Password does not meet the requirements.' });
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
        full_name: fullName,
        status: 'active',
      },
      app_metadata: {
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

    const userId = authData?.user?.id;
    if (!userId) {
      logAccountPhase(traceId, 'auth_create_missing_user_id', { authDataKeys: Object.keys(authData ?? {}) });
      return res.status(502).json({
        message: 'Supabase created the auth user but did not return a user id.',
        code: 'missing_user_id',
        traceId,
      });
    }

    logAccountPhase(traceId, 'auth_create_succeeded', { userId });

    logAccountPhase(traceId, 'syncing_profile_record');
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert(
      {
        id: userId,
        full_name: fullName,
        email,
        username,
        role,
        status: status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
    if (profileError) {
      throw profileError;
    }

    logAccountPhase(traceId, 'syncing_role_membership');
    await syncRoleMembership(userId, role);

    logAccountPhase(traceId, 'create_user_completed');
    res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: userId,
        email,
        username,
        role,
        full_name: fullName,
        status: status || 'active',
      },
    });
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
