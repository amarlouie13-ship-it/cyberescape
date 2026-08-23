import { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '', rememberMe: false, showPassword: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [didSubmitLogin, setDidSubmitLogin] = useState(false);

  const normalizeRole = (role) => {
    const value = String(role ?? '').trim().toLowerCase();
    return ['admin', 'teacher', 'student'].includes(value) ? value : null;
  };

  const redirectByRole = (role) => {
    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) return;

    const destination =
      normalizedRole === 'admin'
        ? '/admin/dashboard'
        : normalizedRole === 'teacher'
          ? '/teacher/dashboard'
          : '/student/dashboard';

    navigate(destination, { replace: true });
  };

  const inferRoleFromSession = (sessionData, profile) => {
    const sessionUser = sessionData?.session?.user;
    const email = String(sessionUser?.email ?? '').toLowerCase();
    const emailRole = email.split('@')[0];

    // Check admin emails first
    if (['admin@cyberescape.local', 'benz@benz.com'].includes(email)) {
      return 'admin';
    }

    return (
      normalizeRole(profile?.role) ||
      normalizeRole(sessionUser?.user_metadata?.role) ||
      normalizeRole(sessionUser?.app_metadata?.role) ||
      (['admin', 'teacher', 'student'].includes(emailRole) ? emailRole : null)
    );
  };

  useEffect(() => {
    if (!loading && user?.role && didSubmitLogin) {
      redirectByRole(user.role);
    }
  }, [didSubmitLogin, loading, navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setDidSubmitLogin(true);

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }

      const email = form.identifier.trim().toLowerCase();
      if (!email.includes('@')) {
        throw new Error('Please enter your Supabase email address.');
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      });

      if (signInError) {
        throw signInError;
      }

      const sessionUser = signInData?.session?.user ?? null;
      const userId = sessionUser?.id;
      const { data: profile } = userId
        ? await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()
        : { data: null };

      const role = inferRoleFromSession(signInData, profile);
      if (role) {
        await refreshUser();
        redirectByRole(role);
      } else {
        throw new Error('Your profile is missing a role.');
      }
    } catch (loginError) {
      setError(loginError?.message || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f5f7fb] px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full max-w-[1500px] overflow-hidden rounded-[28px] border border-slate-300 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.12)]">
        <section className="flex w-full flex-col overflow-y-auto bg-white px-6 py-5 sm:px-10 lg:w-[53%] lg:px-12 lg:py-8 xl:px-14">
          <div className="flex min-h-full flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f766e]/10 ring-1 ring-[#0f766e]/15">
                <ShieldCheck className="h-7 w-7 text-[#0f766e]" />
              </div>
              <div>
                <p className="text-[1.85rem] font-black tracking-tight text-slate-900 sm:text-[2.05rem]">
                  CYBERESCAPE
                </p>
                <p className="text-sm text-slate-500 sm:text-[0.98rem]">Think. Solve. Escape.</p>
              </div>
            </div>

            <div className="mt-8 max-w-[640px]">
              <h1 className="text-[3.25rem] font-extrabold tracking-tight text-slate-950 sm:text-[3.9rem]">
                Welcome <span className="text-[#0f766e]">Back!</span>
              </h1>
              <p className="mt-2.5 text-[1rem] text-slate-600 sm:text-lg">Login to continue your mission.</p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                  <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 shadow-sm transition focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/10">
                    <User className="mr-4 h-5 w-5 text-slate-400" />
                    <input
                      value={form.identifier}
                      onChange={(e) => setForm((prev) => ({ ...prev, identifier: e.target.value }))}
                      className="w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                  <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 shadow-sm transition focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/10">
                    <Lock className="mr-4 h-5 w-5 text-slate-400" />
                    <input
                      type={form.showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                      className="ml-3 text-slate-500 transition hover:text-slate-700"
                      aria-label={form.showPassword ? 'Hide password' : 'Show password'}
                    >
                      {form.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-3 text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.rememberMe}
                      onChange={(e) => setForm((prev) => ({ ...prev, rememberMe: e.target.checked }))}
                      className="h-5 w-5 rounded border-slate-300 text-[#0f766e] focus:ring-[#0f766e]"
                    />
                    Remember me
                  </label>
                  <button type="button" className="font-medium text-[#0f766e] transition hover:text-[#115e59]">
                    Forgot Password?
                  </button>
                </div>

                {error ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#0f766e] to-[#0d9488] px-5 py-3.5 text-lg font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition hover:from-[#115e59] hover:to-[#0f766e] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Lock className="h-5 w-5" />
                  {submitting ? 'LOGGING IN...' : 'LOGIN'}
                </button>

                <div className="flex items-center gap-4 py-1">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-sm font-medium text-slate-400">OR</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <p className="text-center text-sm text-slate-600">
                  Use your Supabase account to sign in.
                </p>

              </form>
            </div>
          </div>
        </section>

        <aside className="relative hidden w-[47%] overflow-hidden bg-[#04111d] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.22),transparent_45%),linear-gradient(180deg,#04111d,#020617)]" />
          <img
            src="/cyberescape-splash.png"
            alt="CyberEscape visual"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#04111d]/35 via-transparent to-[#04111d]" />
          <div className="absolute inset-0 flex flex-col items-center justify-end px-10 pb-16 text-center">
            <div className="max-w-md">
              <p className="text-4xl font-medium leading-tight text-white">
                &ldquo;Cybersecurity
                <br />
                starts with you.&rdquo;
              </p>
            </div>
            <div className="mt-7 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#14b8a6]" />
              <span className="h-2 w-20 rounded-full bg-[#14b8a6]" />
              <span className="h-2 w-2 rounded-full bg-[#14b8a6]" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
