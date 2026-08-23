import { useEffect, useState } from 'react';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import StudentLayout from '../../layouts/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get('/api/dashboard/student/dashboard')
      .then(({ data }) => {
        if (mounted) setSummary(data.progress ?? data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const displayName = user?.username?.trim() || user?.full_name?.trim() || 'Student';

  return (
    <StudentLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell
          sidebar={sidebar}
          onMenuClick={onMenuClick}
          title={`${displayName} Dashboard`}
          subtitle={`Welcome back, ${displayName}! Continue your cybersecurity mission.`}
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Current Score" value={loading ? '...' : summary?.totalScore ?? 0} subtext="Mission points" accent="cyan" />
              <StatCard label="Hints Available" value={loading ? '...' : summary?.hintsAvailable ?? 3} subtext="Unused hints" accent="amber" />
              <StatCard label="Achievements" value={loading ? '...' : summary?.achievements ?? 0} subtext="Earned badges" accent="green" />
              <StatCard label="Current Room" value={loading ? '...' : `Room ${summary?.currentRoom ?? 4}`} subtext="Current mission" accent="purple" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <SectionCard title="Overall Progress" subtitle="Rooms completed: 3 / 8">
                <div className="flex items-center justify-center py-8">
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-12 text-center">
                    <p className="text-5xl font-black text-cyan-300">35%</p>
                    <p className="mt-2 text-sm text-slate-300">Rooms Completed</p>
                  </div>
                </div>
              </SectionCard>

            <SectionCard title="Achievements" subtitle="Earned badges and milestones">
              <div className="grid gap-3 sm:grid-cols-2">
                {(summary?.achievementNames ?? ['First Escape', 'First Puzzle Solved', 'Password Master', 'Phishing Detector', 'No Hint Hero']).map((achievement) => (
                  <div key={achievement} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200">
                    {achievement}
                  </div>
                ))}
              </div>
            </SectionCard>
            </div>

            <SectionCard title="Available Rooms" subtitle="Rooms unlock as you progress">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(summary?.rooms ?? [
                  { room: 'Room 1', name: 'Login Security', difficulty: 'Beginner', status: 'COMPLETED', action: '850' },
                  { room: 'Room 2', name: 'Phishing Email', difficulty: 'Beginner', status: 'COMPLETED', action: '920' },
                  { room: 'Room 3', name: 'Password Security', difficulty: 'Beginner', status: 'AVAILABLE', action: 'PLAY' },
                  { room: 'Room 4', name: 'Malware Investigation', difficulty: 'Intermediate', status: 'IN PROGRESS', action: 'CONTINUE' },
                ]).map(({ room, name, difficulty, status, action }) => (
                  <div key={room} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-cyan-300">{room}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{difficulty}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                        {status}
                      </span>
                      <button
                        type="button"
                        className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950"
                      >
                        {action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </DashboardShell>
      )}
    </StudentLayout>
  );
}
