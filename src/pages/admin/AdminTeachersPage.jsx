import { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import { api } from '../../services/api';

const defaultForm = {
  full_name: '',
  teacher_id: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  status: 'active',
};

function Badge({ status }) {
  const active = String(status).toLowerCase() === 'active';
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${active ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-slate-500/20 bg-slate-500/10 text-slate-300'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function AdminTeachersPage() {
  const [summary, setSummary] = useState({ teachers: [], totals: null });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/teachers');
      setSummary(data ?? { teachers: [], totals: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredTeachers = useMemo(() => {
    const rows = summary.teachers ?? [];
    const query = search.trim().toLowerCase();
    return [...rows]
      .filter((teacher) => {
        const matchesQuery =
          !query ||
          teacher.teacher_id?.toLowerCase().includes(query) ||
          teacher.full_name?.toLowerCase().includes(query) ||
          teacher.username?.toLowerCase().includes(query) ||
          teacher.email?.toLowerCase().includes(query);
        const matchesStatus = status === 'all' || String(teacher.status).toLowerCase() === status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name-az') return a.full_name.localeCompare(b.full_name);
        if (sortBy === 'name-za') return b.full_name.localeCompare(a.full_name);
        if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        if (sortBy === 'last-login') return new Date(b.last_login ?? 0) - new Date(a.last_login ?? 0);
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [search, sortBy, status, summary.teachers]);

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setSortBy('newest');
  };

  const createTeacher = async (event) => {
    event.preventDefault();
    await api.post('/admin/users', {
      email: form.email,
      username: form.username,
      password: form.password,
      confirmPassword: form.confirmPassword,
      role: 'teacher',
    });
    setShowAdd(false);
    setForm(defaultForm);
    load();
  };

  return (
    <AdminLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell sidebar={sidebar} onMenuClick={onMenuClick} title="Teachers" subtitle="Manage teacher accounts and assignments">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">CyberEscape</p>
                <h2 className="text-3xl font-black text-white"># Teachers</h2>
                <p className="text-sm text-slate-400">Manage teacher accounts and assignments</p>
              </div>
              <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0f766e] to-[#14b8a6] px-5 py-3 font-semibold text-white">
                <Plus size={18} /> Add Teacher
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Teachers" value={loading ? '...' : summary.totals?.totalTeachers ?? 0} subtext="Registered teacher accounts" accent="cyan" />
              <StatCard label="Active Teachers" value={loading ? '...' : summary.totals?.activeTeachers ?? 0} subtext="Active status" accent="green" />
              <StatCard label="Inactive Teachers" value={loading ? '...' : summary.totals?.inactiveTeachers ?? 0} subtext="Inactive status" accent="amber" />
              <StatCard label="Assigned Students" value={loading ? '...' : summary.totals?.assignedStudents ?? 0} subtext="Students linked to teachers" accent="purple" />
            </div>

            <SectionCard title="Search & Filters" subtitle="Find teachers quickly">
              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-white outline-none" placeholder="Search Teacher ID, name, username, or email" />
                </label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
                  <option value="name-az">Name A-Z</option>
                  <option value="name-za">Name Z-A</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="last-login">Last Login</option>
                </select>
                <button type="button" onClick={clearFilters} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">Clear Filters</button>
              </div>
            </SectionCard>

            <SectionCard title="Teachers Table" subtitle="View and manage teacher accounts">
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="max-h-[520px] overflow-auto">
                  <table className="min-w-[1100px] w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-950/95 text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Teacher ID</th>
                        <th className="px-4 py-3">Teacher Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Username</th>
                        <th className="px-4 py-3 text-right">Students</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Last Login</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td className="px-4 py-6 text-slate-400" colSpan={8}>Loading teachers...</td></tr>
                      ) : filteredTeachers.length ? (
                        filteredTeachers.map((teacher) => (
                          <tr key={teacher.id} className="border-t border-white/10">
                            <td className="px-4 py-3 text-slate-200">{teacher.teacher_id}</td>
                            <td className="px-4 py-3 text-slate-200">{teacher.full_name}</td>
                            <td className="px-4 py-3 text-slate-200">{teacher.email}</td>
                            <td className="px-4 py-3 text-slate-200">{teacher.username}</td>
                            <td className="px-4 py-3 text-right text-slate-200">{teacher.students}</td>
                            <td className="px-4 py-3"><Badge status={teacher.status} /></td>
                            <td className="px-4 py-3 text-slate-300">{teacher.last_login ? new Date(teacher.last_login).toLocaleString() : 'Never'}</td>
                            <td className="px-4 py-3">
                              <button type="button" onClick={() => setSelected(teacher)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white">
                                <MoreHorizontal size={14} /> Menu
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td className="px-4 py-6 text-slate-400" colSpan={8}>No teachers found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </SectionCard>
          </div>

          {showAdd ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-slate-950 p-6">
                <h3 className="text-2xl font-bold text-white">Add Teacher</h3>
                <p className="mt-1 text-sm text-slate-400">Create a new CyberEscape teacher account.</p>
                <form onSubmit={createTeacher} className="mt-6 grid gap-4 md:grid-cols-2">
                  <input required value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Enter teacher's full name" />
                  <input required value={form.teacher_id} onChange={(e) => setForm((p) => ({ ...p, teacher_id: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="TCH-2026-001" />
                  <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="teacher@example.com" />
                  <input required value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Enter username" />
                  <input required type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white md:col-span-1" placeholder="Enter password" />
                  <input required type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white md:col-span-1" placeholder="Confirm password" />
                  <div className="flex items-center gap-3 md:col-span-2">
                    <button type="button" onClick={() => setShowAdd(false)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">Cancel</button>
                    <button type="submit" className="rounded-2xl bg-gradient-to-r from-[#0f766e] to-[#14b8a6] px-4 py-3 font-semibold text-white">Create Teacher</button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}

          {selected ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-slate-950 p-6">
                <h3 className="text-2xl font-bold text-white">Teacher Details</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-400">Teacher ID:</span> {selected.teacher_id}</p>
                  <p><span className="text-slate-400">Full Name:</span> {selected.full_name}</p>
                  <p><span className="text-slate-400">Email:</span> {selected.email}</p>
                  <p><span className="text-slate-400">Username:</span> {selected.username}</p>
                  <p><span className="text-slate-400">Students Assigned:</span> {selected.students}</p>
                  <p><span className="text-slate-400">Last Login:</span> {selected.last_login ? new Date(selected.last_login).toLocaleString() : 'Never'}</p>
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setSelected(null)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">Close</button>
                </div>
              </div>
            </div>
          ) : null}
        </DashboardShell>
      )}
    </AdminLayout>
  );
}
