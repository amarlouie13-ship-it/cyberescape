import { useEffect, useState } from 'react';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import TeacherLayout from '../../layouts/TeacherLayout';
import { api } from '../../services/api';

export default function TeacherDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .get('/api/dashboard/teacher/dashboard')
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
    <TeacherLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell
          sidebar={sidebar}
          onMenuClick={onMenuClick}
          title="Teacher Dashboard"
          subtitle="Welcome back, Teacher! Monitor your Students' CyberEscape progress."
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <StatCard label="My Students" value={loading ? '...' : summary?.myStudents ?? 0} subtext="Assigned learners" accent="cyan" />
              <StatCard label="Students Playing" value={loading ? '...' : summary?.studentsPlaying ?? 0} subtext="In active sessions" accent="teal" />
              <StatCard label="Rooms Completed" value={loading ? '...' : summary?.roomsCompleted ?? 0} subtext="Cumulative completions" accent="blue" />
              <StatCard label="Average Score" value={loading ? '...' : `${summary?.averageScore ?? 0}%`} subtext="Class performance" accent="purple" />
              <StatCard label="Total Plays" value={loading ? '...' : summary?.totalPlays ?? 0} subtext="Session count" accent="green" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <SectionCard id="students" title="Recent Student Activity" subtitle="Most recent class events">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-slate-400">
                      <tr>
                        <th className="py-3 pr-4">Student</th>
                        <th className="py-3 pr-4">Activity</th>
                        <th className="py-3 pr-4">Room</th>
                        <th className="py-3 pr-4">Score</th>
                        <th className="py-3 pr-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td className="py-4 text-slate-400" colSpan={5}>Loading student activity...</td>
                        </tr>
                      ) : summary?.recentActivity?.length ? (
                        summary.recentActivity.map((row) => (
                          <tr key={row.id} className="border-t border-white/10">
                            <td className="py-3 pr-4 text-slate-200">{row.student_name}</td>
                            <td className="py-3 pr-4 text-slate-200">{row.activity}</td>
                            <td className="py-3 pr-4 text-slate-200">{row.room}</td>
                            <td className="py-3 pr-4 text-slate-200">{row.score}</td>
                            <td className="py-3 pr-4 text-slate-200">{new Date(row.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-4 text-slate-400" colSpan={5}>No recent student activity.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard
                id="progress"
                title="Student Progress"
                subtitle="Average completion"
                action={
                  <button
                    type="button"
                    onClick={() => setShowProgressModal(true)}
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 transition hover:bg-cyan-400/15"
                  >
                    Open
                  </button>
                }
              >
                <button
                  type="button"
                  onClick={() => setShowProgressModal(true)}
                  className="flex h-full w-full items-center justify-center rounded-3xl bg-transparent py-8 text-left"
                >
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-10 text-center transition hover:scale-[1.02]">
                    <p className="text-5xl font-black text-cyan-300">68%</p>
                    <p className="mt-2 text-sm text-slate-300">Average Completion</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cyan-200/80">Click to view details</p>
                  </div>
                </button>
              </SectionCard>
            </div>

            <SectionCard id="performance" title="Teacher Student Performance" subtitle="Performance overview">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="py-3 pr-4">Rank</th>
                      <th className="py-3 pr-4">Student</th>
                      <th className="py-3 pr-4">Rooms Completed</th>
                      <th className="py-3 pr-4">Current Room</th>
                      <th className="py-3 pr-4">Average Score</th>
                      <th className="py-3 pr-4">Attempts</th>
                      <th className="py-3 pr-4">Hints Used</th>
                      <th className="py-3 pr-4">Play Time</th>
                      <th className="py-3 pr-4">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                      <tr>
                        <td className="py-4 text-slate-400" colSpan={9}>Loading performance data...</td>
                      </tr>
                    ) : summary?.studentPerformance?.length ? (
                      summary.studentPerformance.map((row) => (
                        <tr key={row.id} className="border-t border-white/10">
                          <td className="py-3 pr-4 text-slate-200">{row.rank}</td>
                          <td className="py-3 pr-4 text-slate-200">{row.student}</td>
                          <td className="py-3 pr-4 text-slate-200">{row.rooms_completed}</td>
                          <td className="py-3 pr-4 text-slate-200">{row.current_room}</td>
                          <td className="py-3 pr-4 text-slate-200">{row.average_score}%</td>
                          <td className="py-3 pr-4 text-slate-200">{row.attempts}</td>
                          <td className="py-3 pr-4 text-slate-200">{row.hints_used}</td>
                          <td className="py-3 pr-4 text-slate-200">{row.play_time}</td>
                          <td className="py-3 pr-4 text-slate-200">{row.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-4 text-slate-400" colSpan={9}>No student performance data.</td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>
            </SectionCard>

            <SectionCard id="leaderboard" title="Achievement Badges" subtitle="Live student milestones">
              <div className="flex flex-wrap gap-3">
                {(summary?.achievementBadges ?? ['First Escape', 'Password Master', 'Phishing Detector']).map((badge) => (
                  <span key={badge} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                    {badge}
                  </span>
                ))}
              </div>
            </SectionCard>
          </div>

          {showProgressModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
              <button
                type="button"
                className="absolute inset-0 cursor-default"
                onClick={() => setShowProgressModal(false)}
                aria-label="Close progress modal"
              />
              <div className="relative z-10 w-full max-w-2xl rounded-[28px] border border-white/10 bg-slate-950 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Student Progress</p>
                    <h3 className="mt-2 text-2xl font-bold text-white">Average Completion</h3>
                    <p className="mt-1 text-sm text-slate-400">A closer look at current class progress.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProgressModal(false)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="flex items-center justify-center rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 p-8">
                    <div className="text-center">
                      <p className="text-6xl font-black text-cyan-300">68%</p>
                      <p className="mt-2 text-sm text-slate-300">Average Completion</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Students Active</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{loading ? '...' : summary?.studentsPlaying ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Rooms Completed</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{loading ? '...' : summary?.roomsCompleted ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Total Plays</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{loading ? '...' : summary?.totalPlays ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DashboardShell>
      )}
    </TeacherLayout>
  );
}
