import { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import { api } from '../../services/api';

const defaultForm = {
  full_name: '',
  student_id: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  status: 'active',
};

function Badge({ tone, children }) {
  const tones = {
    green: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    red: 'border-red-400/20 bg-red-400/10 text-red-200',
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
    slate: 'border-white/10 bg-white/5 text-slate-200',
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${tones[tone] || tones.slate}`}>{children}</span>;
}

export default function AdminStudentsPage() {
  const [summary, setSummary] = useState({ students: [], totals: null });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [accountStatus, setAccountStatus] = useState('all');
  const [gameStatus, setGameStatus] = useState('all');
  const [progressFilter, setProgressFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/students');
      setSummary(data ?? { students: [], totals: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const rows = summary.students ?? [];
    const query = search.trim().toLowerCase();
    return [...rows]
      .filter((student) => {
        const matchesQuery =
          !query ||
          student.student_id?.toLowerCase().includes(query) ||
          student.full_name?.toLowerCase().includes(query) ||
          student.username?.toLowerCase().includes(query) ||
          student.email?.toLowerCase().includes(query);
        const matchesAccount = accountStatus === 'all' || String(student.status).toLowerCase() === accountStatus;
        const matchesGame = gameStatus === 'all' || String(student.game_status).toLowerCase() === gameStatus.toLowerCase();
        const matchesProgress =
          progressFilter === 'all' ||
          (progressFilter === '0-25' && student.progress <= 25) ||
          (progressFilter === '26-50' && student.progress > 25 && student.progress <= 50) ||
          (progressFilter === '51-75' && student.progress > 50 && student.progress <= 75) ||
          (progressFilter === '76-99' && student.progress > 75 && student.progress < 100) ||
          (progressFilter === '100' && student.progress === 100);
        return matchesQuery && matchesAccount && matchesGame && matchesProgress;
      })
      .sort((a, b) => {
        if (sortBy === 'name-az') return a.full_name.localeCompare(b.full_name);
        if (sortBy === 'name-za') return b.full_name.localeCompare(a.full_name);
        if (sortBy === 'highest-score') return b.score - a.score;
        if (sortBy === 'lowest-score') return a.score - b.score;
        if (sortBy === 'highest-progress') return b.progress - a.progress;
        if (sortBy === 'lowest-progress') return a.progress - b.progress;
        if (sortBy === 'oldest') return new Date(a.last_activity) - new Date(b.last_activity);
        if (sortBy === 'last-active') return new Date(b.last_activity) - new Date(a.last_activity);
        return new Date(b.last_activity) - new Date(a.last_activity);
      });
  }, [accountStatus, gameStatus, progressFilter, search, sortBy, summary.students]);

  const createStudent = async (event) => {
    event.preventDefault();
    await api.post('/admin/users', {
      email: form.email,
      username: form.username,
      password: form.password,
      confirmPassword: form.confirmPassword,
      role: 'student',
    });
    setShowAdd(false);
    setForm(defaultForm);
    load();
  };

  const clearFilters = () => {
    setSearch('');
    setAccountStatus('all');
    setGameStatus('all');
    setProgressFilter('all');
    setSortBy('newest');
  };

  return (
    <AdminLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell sidebar={sidebar} onMenuClick={onMenuClick} title="Students" subtitle="Monitor and manage student accounts">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">CyberEscape</p>
                <h2 className="text-3xl font-black text-white"># Students</h2>
                <p className="text-sm text-slate-400">Monitor and manage student accounts</p>
              </div>
              <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0f766e] to-[#14b8a6] px-5 py-3 font-semibold text-white">
                <Plus size={18} /> Add Student
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Students" value={loading ? '...' : summary.totals?.totalStudents ?? 0} subtext="Registered student accounts" accent="cyan" />
              <StatCard label="Active Students" value={loading ? '...' : summary.totals?.activeStudents ?? 0} subtext="Active accounts" accent="green" />
              <StatCard label="Currently Playing" value={loading ? '...' : summary.totals?.currentlyPlaying ?? 0} subtext="Active sessions" accent="teal" />
              <StatCard label="Completed Students" value={loading ? '...' : summary.totals?.completedStudents ?? 0} subtext="Completed all required rooms" accent="purple" />
            </div>

            <SectionCard title="Search & Filters" subtitle="Find students quickly">
              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto]">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-white outline-none" placeholder="Search Student ID, name, username, or email" />
                </label>
                <select value={accountStatus} onChange={(e) => setAccountStatus(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
                  <option value="all">All Account Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select value={gameStatus} onChange={(e) => setGameStatus(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
                  <option value="all">All Game Status</option>
                  <option value="not started">Not Started</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select value={progressFilter} onChange={(e) => setProgressFilter(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
                  <option value="all">All Progress</option>
                  <option value="0-25">0-25%</option>
                  <option value="26-50">26-50%</option>
                  <option value="51-75">51-75%</option>
                  <option value="76-99">76-99%</option>
                  <option value="100">100%</option>
                </select>
                <button type="button" onClick={clearFilters} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">Clear Filters</button>
              </div>
            </SectionCard>

            <SectionCard title="Students Table" subtitle="Monitor student accounts">
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="max-h-[560px] overflow-auto">
                  <table className="min-w-[1300px] w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-950/95 text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Student ID</th>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3 text-right">Progress</th>
                        <th className="px-4 py-3 text-right">Rooms Completed</th>
                        <th className="px-4 py-3 text-right">Score</th>
                        <th className="px-4 py-3">Game Status</th>
                        <th className="px-4 py-3">Account Status</th>
                        <th className="px-4 py-3">Last Activity</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td className="px-4 py-6 text-slate-400" colSpan={10}>Loading students...</td></tr>
                      ) : filtered.length ? (
                        filtered.map((student) => (
                          <tr key={student.id} className="border-t border-white/10">
                            <td className="px-4 py-3 text-slate-200">{student.student_id}</td>
                            <td className="px-4 py-3 text-slate-200">{student.full_name}</td>
                            <td className="px-4 py-3 text-slate-200">{student.email}</td>
                            <td className="px-4 py-3 text-right text-slate-200">{student.progress}%</td>
                            <td className="px-4 py-3 text-right text-slate-200">{student.rooms_completed}</td>
                            <td className="px-4 py-3 text-right text-slate-200">{student.score}</td>
                            <td className="px-4 py-3"><Badge tone={student.game_status === 'Completed' ? 'green' : student.game_status === 'In Progress' ? 'cyan' : 'slate'}>{student.game_status}</Badge></td>
                            <td className="px-4 py-3"><Badge tone={student.status === 'active' ? 'green' : 'red'}>{student.status === 'active' ? 'Active' : 'Inactive'}</Badge></td>
                            <td className="px-4 py-3 text-slate-300">{student.last_activity ? new Date(student.last_activity).toLocaleString() : 'Never'}</td>
                            <td className="px-4 py-3">
                              <button type="button" onClick={() => setSelected(student)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white">
                                <MoreHorizontal size={14} /> Menu
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td className="px-4 py-6 text-slate-400" colSpan={10}>No students found.</td></tr>
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
                <h3 className="text-2xl font-bold text-white">Add Student</h3>
                <p className="mt-1 text-sm text-slate-400">Create a new CyberEscape student account.</p>
                <form onSubmit={createStudent} className="mt-6 grid gap-4 md:grid-cols-2">
                  <input required value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Enter student's full name" />
                  <input required value={form.student_id} onChange={(e) => setForm((p) => ({ ...p, student_id: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="STD-2026-001" />
                  <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="student@example.com" />
                  <input required value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Enter username" />
                  <input required type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Enter password" />
                  <input required type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Confirm password" />
                  <div className="flex gap-3 md:col-span-2">
                    <button type="button" onClick={() => setShowAdd(false)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">Cancel</button>
                    <button type="submit" className="rounded-2xl bg-gradient-to-r from-[#0f766e] to-[#14b8a6] px-4 py-3 font-semibold text-white">Create Student</button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}

          {selected ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-slate-950 p-6">
                <h3 className="text-2xl font-bold text-white">Student Details</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-400">Student ID:</span> {selected.student_id}</p>
                  <p><span className="text-slate-400">Full Name:</span> {selected.full_name}</p>
                  <p><span className="text-slate-400">Email:</span> {selected.email}</p>
                  <p><span className="text-slate-400">Username:</span> {selected.username}</p>
                  <p><span className="text-slate-400">Progress:</span> {selected.progress}%</p>
                  <p><span className="text-slate-400">Game Status:</span> {selected.game_status}</p>
                  <p><span className="text-slate-400">Last Activity:</span> {selected.last_activity ? new Date(selected.last_activity).toLocaleString() : 'Never'}</p>
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
