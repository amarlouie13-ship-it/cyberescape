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

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
