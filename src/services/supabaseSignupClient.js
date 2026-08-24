import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(value) {
  const input = String(value ?? '').trim().replace(/\/+$/, '');
  if (!input) return '';
  return input
    .replace(/\/auth\/v1$/i, '')
    .replace(/\/rest\/v1$/i, '')
    .replace(/\/graphql\/v1$/i, '');
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const memoryStorage = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {},
};

export const supabaseSignupClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storage: memoryStorage,
        },
      })
    : null;
