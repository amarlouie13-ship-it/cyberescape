import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_FULL_NAME = 'CyberEscape Admin',
  ADMIN_USERNAME = 'admin',
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: existingUser, error: lookupError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (lookupError) {
    throw lookupError;
  }

  const existing = existingUser.users.find((user) => user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  let authUserId = existing?.id;

  if (!authUserId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: ADMIN_FULL_NAME,
        username: ADMIN_USERNAME,
        role: 'admin',
      },
    });

    if (error) {
      throw error;
    }

    authUserId = data.user.id;
    console.log(`Created Supabase Auth admin user: ${ADMIN_EMAIL}`);
  } else {
    const { error } = await supabase.auth.admin.updateUserById(authUserId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: ADMIN_FULL_NAME,
        username: ADMIN_USERNAME,
        role: 'admin',
      },
    });

    if (error) {
      throw error;
    }

    console.log(`Updated Supabase Auth admin user: ${ADMIN_EMAIL}`);
  }

  const profilePayload = {
    id: authUserId,
    full_name: ADMIN_FULL_NAME,
    email: ADMIN_EMAIL,
    username: ADMIN_USERNAME,
    role: 'admin',
    status: 'active',
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' });

  if (profileError) {
    throw profileError;
  }

  console.log('Admin profile synced in public.profiles.');
}

main().catch((error) => {
  console.error('Failed to seed admin:', error.message);
  process.exit(1);
});
