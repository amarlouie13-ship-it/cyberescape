import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

function resolveRole(profile, sessionUser) {
  const emailRole = String(sessionUser?.email ?? '')
    .toLowerCase()
    .split('@')[0];

  return (
    profile?.role ||
    sessionUser?.user_metadata?.role ||
    sessionUser?.app_metadata?.role ||
    (['admin', 'teacher', 'student'].includes(emailRole) ? emailRole : null)
  );
}

function buildUser(profile, sessionUser) {
  if (!sessionUser) {
    return null;
  }

  const role = resolveRole(profile, sessionUser);

  return {
    id: profile?.id ?? sessionUser.id,
    full_name: profile?.full_name ?? sessionUser.user_metadata?.full_name ?? '',
    email: profile?.email ?? sessionUser.email ?? '',
    username: profile?.username ?? sessionUser.user_metadata?.username ?? '',
    role,
    status: profile?.status ?? 'active',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    try {
      if (!supabase) {
        setUser(null);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user ?? null;

      if (!sessionUser) {
        setUser(null);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, username, role, status')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (!error) {
        setUser(buildUser(profile, sessionUser));
        return;
      }

      setUser(buildUser(null, sessionUser));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    if (!supabase) {
      return undefined;
    }

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email, username, role, status')
        .eq('id', session.user.id)
        .maybeSingle();

      setUser(buildUser(profile, session.user));
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      refreshUser: loadSession,
      logout: async () => {
        if (supabase) {
          await supabase.auth.signOut();
        }
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
