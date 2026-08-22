import { useMemo, useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import AdminLayout from '../../layouts/AdminLayout';
import { api } from '../../services/api';

const roleOptions = [
  { label: 'Admin', value: 'admin', description: 'Full system access' },
  { label: 'Teacher', value: 'teacher', description: 'Monitor and guide students' },
  { label: 'Student', value: 'student', description: 'Play rooms and solve puzzles' },
];

export default function AddUserPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '', role: 'admin' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const selectedRole = useMemo(
    () => roleOptions.find((option) => option.value === form.role) ?? roleOptions[1],
    [form.role],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      if (form.password !== form.confirmPassword) {
        setStatus({ type: 'error', message: 'Passwords do not match.' });
        return;
      }

      const { data } = await api.post('/admin/users', {
        email: form.email,
        username: form.username,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
      });

      setStatus({ type: 'success', message: data?.message || 'User created successfully.' });
      setForm({ email: '', username: '', password: '', confirmPassword: '', role: form.role });
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Unable to create user.';
      const backendCode = error?.response?.data?.code;
      const traceId = error?.response?.data?.traceId;
      const diagnosticSuffix = [backendCode ? `Code: ${backendCode}` : null, traceId ? `Trace: ${traceId}` : null]
        .filter(Boolean)
        .join(' | ');
      setStatus({
        type: 'error',
        message:
          backendMessage === 'Network Error'
            ? 'Unable to reach the API server. Make sure the backend is running.'
            : diagnosticSuffix
              ? `${backendMessage} (${diagnosticSuffix})`
              : backendMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell sidebar={sidebar} onMenuClick={onMenuClick} title="Add User" subtitle="Create secure admin-managed accounts">
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <SectionCard title="New Account" subtitle="Only admins can create users">
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                    placeholder="Enter email"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Username</span>
                  <input
                    value={form.username}
                    onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                    placeholder="Enter username"
                    autoComplete="off"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Password</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                    placeholder="Enter password"
                    autoComplete="new-password"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Confirm Password</span>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    required
                  />
                </label>

                <div>
                  <span className="mb-2 block text-sm text-slate-300">Role</span>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {status.message ? (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      status.type === 'success'
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                        : 'border-red-400/30 bg-red-400/10 text-red-200'
                    }`}
                  >
                    {status.message}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#0f766e] to-[#14b8a6] px-5 py-3.5 font-semibold text-white shadow-[0_14px_30px_rgba(20,184,166,0.2)] transition hover:from-[#115e59] hover:to-[#0f766e] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <UserPlus size={18} />
                  {submitting ? 'Creating User...' : 'Create User'}
                </button>
              </form>
            </SectionCard>

            <SectionCard title="Access Rules" subtitle="Admin-only security notes">
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-300" />
                  <p>The backend validates the authenticated user role before creating any account.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">Account Rules</p>
                  <ul className="mt-3 space-y-2 text-slate-400">
                    <li>• Username must be unique.</li>
                    <li>• Password confirmation must match.</li>
                    <li>• Role is restricted to Admin, Teacher, or Student.</li>
                    <li>• Passwords are stored by the auth provider, not in plain text.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-100">
                  Selected Role: {selectedRole.label}
                </div>
              </div>
            </SectionCard>
          </div>
        </DashboardShell>
      )}
    </AdminLayout>
  );
}
