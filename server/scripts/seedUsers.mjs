import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAIL = 'admin@cyberescape.local',
  ADMIN_PASSWORD,
  ADMIN_FULL_NAME = 'CyberEscape Admin',
  ADMIN_USERNAME = 'admin',
  TEACHER_EMAIL = 'teacher@cyberescape.local',
  TEACHER_PASSWORD,
  TEACHER_FULL_NAME = 'CyberEscape Teacher',
  TEACHER_USERNAME = 'teacher',
  STUDENT_EMAIL = 'student@cyberescape.local',
  STUDENT_PASSWORD,
  STUDENT_FULL_NAME = 'CyberEscape Student',
  STUDENT_USERNAME = 'student',
} = process.env;

function getJwtRole(token) {
  try {
    const payloadPart = String(token || '').split('.')[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    return payload.role || null;
  } catch {
    return null;
  }
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

if (getJwtRole(SUPABASE_SERVICE_ROLE_KEY) !== 'service_role') {
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY must be the real Supabase service_role key. The current value is not a service role token.',
  );
  process.exit(1);
}

if (!ADMIN_PASSWORD || !TEACHER_PASSWORD || !STUDENT_PASSWORD) {
  console.error('Missing one or more role passwords: ADMIN_PASSWORD, TEACHER_PASSWORD, STUDENT_PASSWORD.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function upsertAuthUser({ email, password, fullName, username, role }) {
  const { data: users, error: lookupError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (lookupError) {
    throw lookupError;
  }

  const existing = users.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

  let authUserId = existing?.id;

  if (!authUserId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username,
        role,
      },
    });

    if (error) {
      throw error;
    }

    authUserId = data.user.id;
    console.log(`Created Supabase Auth ${role} user: ${email}`);
  } else {
    const { error } = await supabase.auth.admin.updateUserById(authUserId, {
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username,
        role,
      },
    });

    if (error) {
      throw error;
    }

    console.log(`Updated Supabase Auth ${role} user: ${email}`);
  }

  const profilePayload = {
    id: authUserId,
    full_name: fullName,
    email,
    username,
    role,
    status: 'active',
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' });

  if (profileError) {
    throw profileError;
  }

  if (role === 'student') {
    const { error } = await supabase.from('students').upsert(
      {
        profile_id: authUserId,
        student_number: `STU-${authUserId.slice(0, 8).toUpperCase()}`,
      },
      { onConflict: 'profile_id' },
    );
    if (error) throw error;
  }

  if (role === 'teacher') {
    const { error } = await supabase.from('teachers').upsert(
      {
        profile_id: authUserId,
        employee_number: `TCH-${authUserId.slice(0, 8).toUpperCase()}`,
      },
      { onConflict: 'profile_id' },
    );
    if (error) throw error;
  }

  return authUserId;
}

async function main() {
  await upsertAuthUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    fullName: ADMIN_FULL_NAME,
    username: ADMIN_USERNAME,
    role: 'admin',
  });

  await upsertAuthUser({
    email: TEACHER_EMAIL,
    password: TEACHER_PASSWORD,
    fullName: TEACHER_FULL_NAME,
    username: TEACHER_USERNAME,
    role: 'teacher',
  });

  await upsertAuthUser({
    email: STUDENT_EMAIL,
    password: STUDENT_PASSWORD,
    fullName: STUDENT_FULL_NAME,
    username: STUDENT_USERNAME,
    role: 'student',
  });

  console.log('Supabase admin, teacher, and student users are synced.');
}

main().catch((error) => {
  console.error('Failed to seed users:', error.message);
  process.exit(1);
});
