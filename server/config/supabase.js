import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(value) {
  const input = String(value ?? '').trim().replace(/\/+$/, '');
  if (!input) {
    return '';
  }

  return input
    .replace(/\/auth\/v1$/i, '')
    .replace(/\/rest\/v1$/i, '')
    .replace(/\/graphql\/v1$/i, '');
}

const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

export const supabaseAuth =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
