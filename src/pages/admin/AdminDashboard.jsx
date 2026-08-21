import { useEffect, useMemo, useState } from 'react';
import { BellRing, Search } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const registrations = [
  { name: 'Teachers', value: 18 },
  { name: 'Students', value: 54 },
];

const completion = [{ name: 'Completion', value: 68, fill: '#22D3EE' }];

export default function AdminDashboard() {
  const { user } = useAuth();
  const searchPlaceholder = useMemo(() => `Search as ${user?.full_name ?? 'Admin'}`, [user?.full_name]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get('/api/dashboard/admin/dashboard')
      .then(({ data }) => {
        if (mounted) setSummary(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell
          sidebar={sidebar}
          onMenuClick={onMenuClick}
          title="Dashboard"
          subtitle="Monitor the CyberEscape ecosystem"
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard label="Total Users" value={loading ? '...' : summary?.totalUsers ?? 0} subtext="Active accounts" accent="cyan" />
              <StatCard label="Teachers" value={loading ? '...' : summary?.teachers ?? 0} subtext="Monitoring classes" accent="purple" />
              <StatCard label="Students" value={loading ? '...' : summary?.students ?? 0} subtext="Registered players" accent="blue" />
              <StatCard label="Rooms" value={loading ? '...' : summary?.rooms ?? 0} subtext="CyberEscape rooms" accent="teal" />
              <StatCard label="Puzzles" value={loading ? '...' : summary?.puzzles ?? 0} subtext="Validation challenges" accent="green" />
              <StatCard label="Active Players" value={loading ? '...' : summary?.activePlayers ?? 0} subtext="Currently in session" accent="amber" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <SectionCard
                title="User Registration"
                subtitle="Last 7 Days"
                action={
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                    <Search size={16} />
                    <span>{searchPlaceholder}</span>
                  </div>
                }
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={registrations}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="name" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#22D3EE" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="System Status" subtitle="Realtime health overview">
                <div className="space-y-4 text-sm text-slate-300">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">Database connected</div>
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">Authentication active</div>
                  <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">Room validation online</div>
                  <div className="rounded-2xl border border-purple-400/20 bg-purple-400/10 p-4">Activity logging enabled</div>
                </div>
              </SectionCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <SectionCard title="Recent Activity" subtitle="Latest CyberEscape events">
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-slate-400">Loading recent activity...</p>
                  ) : summary?.activity?.length ? (
                    summary.activity.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{item.action}</p>
                          <p className="text-sm text-slate-400">{item.module}</p>
                        </div>
                        <span className="text-sm text-slate-500">{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No recent activities.</p>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Room Overview" subtitle="Completion rate and average scores">
                <div className="space-y-3">
                  {adminOverview.rooms.map(([room, name, difficulty, status, completionRate, score]) => (
                    <div key={room} className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm md:grid-cols-6">
                      <div>
                        <p className="text-slate-400">Room</p>
                        <p className="font-medium text-white">{room}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Name</p>
                        <p className="font-medium text-white">{name}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Difficulty</p>
                        <p className="font-medium text-white">{difficulty}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Status</p>
                        <p className="font-medium text-emerald-300">{status}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Completion</p>
                        <p className="font-medium text-white">{completionRate}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Avg Score</p>
                        <p className="font-medium text-white">{score}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Achievement Badges" subtitle="Live unlocked system achievements">
              <div className="flex flex-wrap gap-3">
                {(summary?.achievementBadges ?? ['First Escape', 'Password Master', 'Phishing Detector']).map((badge) => (
                  <span key={badge} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                    {badge}
                  </span>
                ))}
              </div>
            </SectionCard>
          </div>
        </DashboardShell>
      )}
    </AdminLayout>
  );
}
