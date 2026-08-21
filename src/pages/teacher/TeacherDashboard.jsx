import { useEffect, useState } from 'react';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import TeacherLayout from '../../layouts/TeacherLayout';
import { api } from '../../services/api';

export default function TeacherDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

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
              <SectionCard title="Recent Student Activity" subtitle="Most recent class events">
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

              <SectionCard title="Student Progress" subtitle="Average completion">
                <div className="flex h-full items-center justify-center">
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-10 text-center">
                    <p className="text-5xl font-black text-cyan-300">68%</p>
                    <p className="mt-2 text-sm text-slate-300">Average Completion</p>
                  </div>
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Teacher Student Performance" subtitle="Performance overview">
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

            <SectionCard title="Achievement Badges" subtitle="Live student milestones">
              <div className="flex flex-wrap gap-3">
                {(summary?.achievementBadges ?? ['First Escape', 'Password Master', 'Phishing Detector']).map((badge) => (
                  <span key={badge} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                    {badge}
                  </span>
                ))}
              </div>
            </SectionCard>
          </div>
        </DashboardShell>
      )}
    </TeacherLayout>
  );
}
