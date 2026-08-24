import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, MoreHorizontal, Plus, Search, X } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import { api } from '../../services/api';

const emptyForm = {
  role: '',
  full_name: '',
  username: '',
  email: '',
  assigned_teacher_id: '',
  password: '',
  confirmPassword: '',
};

const emptyErrors = {};

function isValidEmail(value) {
  const email = String(value ?? '').trim().toLowerCase();
  return /^[a-z0-9._%+-]+@gmail\.com$/.test(email);
}

function passwordChecks(value) {
  const text = String(value ?? '');
  return {
    length: text.length >= 8,
    upper: /[A-Z]/.test(text),
    lower: /[a-z]/.test(text),
    number: /\d/.test(text),
    special: /[^A-Za-z0-9]/.test(text),
  };
}

function Badge({ active, children }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${active ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-300'}`}>{children}</span>;
}

function Field({ label, required, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">
        {label}{required ? ' *' : ''}
      </span>
      {children}
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </label>
  );
}

function SelectField({ value, onChange, children, placeholder, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full appearance-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 pr-11 text-white outline-none transition focus:border-cyan-400/60 ${className}`}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {children}
      </select>
      <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
        <path fill="currentColor" d="M5.5 7.5 10 12l4.5-4.5 1.5 1.5L10 15 4 9z" />
      </svg>
    </div>
  );
}

function PasswordField({ value, onChange, visible, onToggle, placeholder, error, label }) {
  return (
    <Field label={label} required error={error}>
      <div className="relative">
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={visible ? 'text' : 'password'}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white outline-none transition focus:border-cyan-400/60"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-r-2xl px-4 py-3 text-slate-400 transition hover:text-cyan-300"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </Field>
  );
}

export default function AddUserPage() {
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState(emptyErrors);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [assignments, setAssignments] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, teachersRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/teachers'),
      ]);
      setUsers(usersRes.data?.users ?? []);
      setTeachers(teachersRes.data?.teachers ?? []);
      setAssignments(usersRes.data?.assignments ?? []);
      window.dispatchEvent(new CustomEvent('admin-users-updated'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !query ||
        user.user_id?.toLowerCase().includes(query) ||
        user.full_name?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    teachers: users.filter((user) => user.role === 'teacher').length,
    students: users.filter((user) => user.role === 'student').length,
    active: users.filter((user) => user.status === 'online').length,
  }), [users]);

  const selectedTeacherOptions = useMemo(
    () => teachers.filter((teacher) => String(teacher.status).toLowerCase() === 'online'),
    [teachers],
  );

  const currentChecks = passwordChecks(form.password);
  const canSubmit =
    !submitting &&
    form.role &&
    form.full_name.trim() &&
    form.username.trim() &&
    isValidEmail(form.email) &&
    currentChecks.length &&
    currentChecks.upper &&
    currentChecks.lower &&
    currentChecks.number &&
    currentChecks.special &&
    form.password === form.confirmPassword;

  const validateForm = () => {
    const next = {};
    if (!form.role) next.role = 'Role is required.';
    if (!form.full_name.trim()) next.full_name = 'Full name is required.';
    if (!form.username.trim()) next.username = 'Username is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!isValidEmail(form.email)) next.email = 'Please enter a valid Gmail address (example: name@gmail.com).';
    if (!currentChecks.length || !currentChecks.upper || !currentChecks.lower || !currentChecks.number || !currentChecks.special) {
      next.password = 'Password does not meet the requirements.';
    }
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const closeAdd = () => {
    if (submitting) return;
    if (JSON.stringify(form) !== JSON.stringify(emptyForm) && !window.confirm('Discard unsaved changes?')) {
      return;
    }
    setShowAdd(false);
    setForm(emptyForm);
    setErrors(emptyErrors);
    setShowPassword(false);
    setShowConfirm(false);
  };

  const submitUser = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setMessage('');
    try {
      const { data } = await api.post('/admin/users', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
        full_name: form.full_name.trim(),
        username: form.username.trim().toLowerCase(),
        assigned_teacher_id: form.role === 'student' ? form.assigned_teacher_id || '' : '',
      });

      if (!data?.user?.id) {
        throw new Error('The server did not return a new user.');
      }

      setShowAdd(false);
      setForm(emptyForm);
      setErrors(emptyErrors);
      setShowPassword(false);
      setShowConfirm(false);
      setMessage(`${form.role === 'teacher' ? 'Teacher' : 'Student'} account created successfully.`);
      await load();
      window.dispatchEvent(new CustomEvent('admin-users-updated'));
    } catch (error) {
      const errorMessage = String(error?.message ?? '');
      const errorDetails = String(error?.details ?? '');
      const combinedMessage = [errorMessage, errorDetails]
        .filter(Boolean)
        .join(' | ');
      setErrors({
        submit:
          errorMessage.includes('username') ? 'Username is already in use.' :
          errorMessage.includes('email') ? 'Email is already registered.' :
          combinedMessage || error?.message || 'Unable to create user. Please check the information and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    await api.put(`/admin/users/${editing.id}`, {
      full_name: editing.full_name,
      username: editing.username,
      email: editing.email,
      status: editing.status,
    });
    setEditing(null);
    setMessage('User updated successfully.');
    await load();
  };

  const resetProgress = async (user) => {
    if (!window.confirm('Reset Student Progress?\n\nThis will remove the student\'s room progress, scores, attempts, hints, and related gameplay progress. This action cannot be undone.')) return;
    await api.delete(`/admin/users/${user.id}/progress`);
    setMessage('Student progress reset.');
    await load();
  };

  return (
    <AdminLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell sidebar={sidebar} onMenuClick={onMenuClick} title="User Management" subtitle="Manage teacher and student accounts">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">CyberEscape</p>
                <h2 className="text-3xl font-black text-white">User Management</h2>
                <p className="text-sm text-slate-400">Manage teacher and student accounts</p>
              </div>
              <button type="button" onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">
                <Plus size={18} /> Add User
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Users" value={loading ? '...' : stats.total} subtext="Teacher + Student accounts" accent="cyan" />
              <StatCard label="Teachers" value={loading ? '...' : stats.teachers} subtext="Teacher accounts" accent="purple" />
              <StatCard label="Students" value={loading ? '...' : stats.students} subtext="Student accounts" accent="blue" />
      <StatCard label="Online Users" value={loading ? '...' : stats.active} subtext="Currently online" accent="green" />
            </div>

            <SectionCard title="Search & Filters" subtitle="Find users quickly">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-[1.25fr_0.95fr_0.95fr]">
                <div className="w-full">
                  <label className="flex h-11 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 min-w-0">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full min-w-0 bg-transparent text-white outline-none placeholder:text-slate-500"
                      placeholder="Search by name, username, email, or user ID"
                    />
                  </label>
                </div>
                <div className="w-full">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 text-white outline-none">
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div className="w-full">
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 text-white outline-none">
                    <option value="all">All Users</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Users Table" subtitle="Teacher and student accounts">
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="max-h-[600px] overflow-auto">
                  <table className="min-w-[1200px] w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-950/95 text-slate-400">
                      <tr>
                        <th className="px-4 py-3">User ID</th>
                        <th className="px-4 py-3">Full Name</th>
                        <th className="px-4 py-3">Username</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Date Created</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td className="px-4 py-6 text-slate-400" colSpan={8}>Loading users...</td></tr>
                      ) : filtered.length ? (
                        filtered.map((user) => (
                          <tr key={user.id} className="border-t border-white/10">
                            <td className="px-4 py-3 text-slate-200">{user.user_id}</td>
                            <td className="px-4 py-3 text-slate-200">{user.full_name}</td>
                            <td className="px-4 py-3 text-slate-200">{user.username}</td>
                            <td className="px-4 py-3 text-slate-200">{user.email}</td>
                            <td className="px-4 py-3">
                              <Badge active>
                                {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Teacher' : 'Student'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${user.status === 'online' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                                <span className={`h-2 w-2 rounded-full ${user.status === 'online' ? 'bg-emerald-300' : 'bg-slate-400'}`} />
                                {user.status === 'online' ? 'Online' : 'Offline'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-300">{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</td>
                            <td className="px-4 py-3">
                              <button type="button" onClick={() => setSelected(user)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white">
                                <MoreHorizontal size={14} /> View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td className="px-4 py-6 text-slate-400" colSpan={8}>No users found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </SectionCard>

            {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
          </div>

          {showAdd ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8" onMouseDown={(e) => e.target === e.currentTarget && closeAdd()}>
              <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[24px] border border-cyan-400/20 bg-slate-950 p-5 shadow-2xl shadow-cyan-950/20 sm:p-6">
                <div className="max-h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden pr-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Create New User</h3>
                    <p className="mt-1 text-sm text-slate-400">Create a new Teacher or Student account</p>
                  </div>
                  <button type="button" onClick={closeAdd} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200 disabled:opacity-50" disabled={submitting}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={submitUser} className="mt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Role" required error={errors.role}>
                      <SelectField value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value, assigned_teacher_id: '' }))} placeholder="Select role">
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                      </SelectField>
                    </Field>

                    <Field label="Full Name" required error={errors.full_name}>
                      <input value={form.full_name} onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))} placeholder="Enter full name" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/60" />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Username" required error={errors.username}>
                      <input value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} placeholder="Enter username" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/60" />
                    </Field>

                    <Field label="Email" required error={errors.email}>
                      <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="name@gmail.com" type="email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/60" />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <PasswordField
                      label="Password"
                      required
                      error={errors.password}
                      value={form.password}
                      onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      visible={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                      placeholder="Enter password"
                    />

                    <PasswordField
                      label="Confirm Password"
                      required
                      error={errors.confirmPassword}
                      value={form.confirmPassword}
                      onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      visible={showConfirm}
                      onToggle={() => setShowConfirm((v) => !v)}
                      placeholder="Re-enter password"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {form.role === 'student' ? (
                      <Field label="Assigned Teacher" error={errors.assigned_teacher_id}>
                        <SelectField value={form.assigned_teacher_id} onChange={(e) => setForm((prev) => ({ ...prev, assigned_teacher_id: e.target.value }))} placeholder="Unassigned">
                          {selectedTeacherOptions.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>
                          ))}
                        </SelectField>
                      </Field>
                    ) : <div />}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">Password requirements</p>
                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      {[
                        ['length', '8 or more characters'],
                        ['upper', 'Uppercase letter'],
                        ['lower', 'Lowercase letter'],
                        ['number', 'Number'],
                        ['special', 'Special character'],
                      ].map(([key, label]) => {
                        const met = currentChecks[key];
                        return <p key={key} className={met ? 'text-emerald-200' : 'text-slate-400'}>{met ? '✓' : '○'} {label}</p>;
                      })}
                    </div>
                  </div>

                  {errors.submit ? <p className="text-sm text-rose-300">{errors.submit}</p> : null}

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={closeAdd} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white disabled:opacity-50" disabled={submitting}>Cancel</button>
                    <button type="submit" disabled={!canSubmit} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                          Creating User...
                        </>
                      ) : 'Create User'}
                    </button>
                  </div>
                </form>
                </div>
              </div>
            </div>
          ) : null}

          {selected ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[28px] border border-white/10 bg-slate-950 p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold text-white">{selected.role === 'teacher' ? 'Teacher Details' : 'Student Details'}</h3>
                  <button onClick={() => setSelected(null)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white">Close</button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <SectionCard title="Information" subtitle="User profile">
                    <div className="space-y-2 text-sm text-slate-300">
                      <p><span className="text-slate-400">User ID:</span> {selected.user_id}</p>
                      <p><span className="text-slate-400">Full Name:</span> {selected.full_name}</p>
                      <p><span className="text-slate-400">Username:</span> {selected.username}</p>
                      <p><span className="text-slate-400">Email:</span> {selected.email}</p>
                      <p><span className="text-slate-400">Status:</span> {selected.status === 'online' ? 'Online' : 'Offline'}</p>
                      <p><span className="text-slate-400">Date Created:</span> {selected.created_at ? new Date(selected.created_at).toLocaleString() : '-'}</p>
                    </div>
                  </SectionCard>
                  <SectionCard title="Stats" subtitle="Live progress summary">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <StatCard label="Rooms Completed" value={selected.rooms_completed ?? '0/8'} subtext="Progress" accent="cyan" />
                      <StatCard label="Total Score" value={selected.score ?? 0} subtext="Points earned" accent="green" />
                      <StatCard label="Attempts" value={selected.attempts ?? 0} subtext="Puzzle attempts" accent="purple" />
                      <StatCard label="Hints Used" value={selected.hints_used ?? 0} subtext="Hints consumed" accent="amber" />
                    </div>
                  </SectionCard>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => setEditing(selected)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white">Edit {selected.role === 'teacher' ? 'Teacher' : 'Student'}</button>
                    <button type="button" onClick={() => api.put(`/admin/users/${selected.id}`, { status: selected.status === 'online' ? 'offline' : 'online' }).then(load)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white">Toggle Online / Offline</button>
                    {selected.role === 'student' ? <button type="button" onClick={() => resetProgress(selected)} className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-rose-100">Reset Game Progress</button> : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DashboardShell>
      )}
    </AdminLayout>
  );
}
