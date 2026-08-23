import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, LineChart, Eye, UserRoundSearch } from 'lucide-react';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import TeacherLayout from '../../layouts/TeacherLayout';
import { api } from '../../services/api';

function EmptyState({ message, subtext }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center">
      <p className="text-sm font-medium text-slate-200">{message}</p>
      {subtext ? <p className="mt-1 text-sm text-slate-400">{subtext}</p> : null}
    </div>
  );
}

function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'border-white/10 bg-white/5 text-slate-200',
    green: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    red: 'border-red-400/20 bg-red-400/10 text-red-200',
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${tones[tone] || tones.slate}`}>{children}</span>;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/dashboard/teacher/dashboard');
      setSummary(data ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: 'Total Students',
        value: loading ? '...' : summary?.myStudents ?? 'No students assigned yet',
        subtext: 'Assigned learners',
        accent: 'cyan',
      },
      {
        label: 'Currently Playing',
        value: loading ? '...' : summary?.studentsPlaying ?? 'No active sessions',
        subtext: 'Active sessions',
        accent: 'teal',
      },
      {
        label: 'Rooms Completed',
        value: loading ? '...' : summary?.roomsCompleted ?? 'No completions yet',
        subtext: 'Cumulative completions',
        accent: 'blue',
      },
      {
        label: 'Average Score',
        value: loading ? '...' : `${summary?.averageScore ?? 0}%`,
        subtext: 'Class performance',
        accent: 'purple',
      },
      {
        label: 'Total Game Sessions',
        value: loading ? '...' : summary?.totalPlays ?? 'No sessions yet',
        subtext: 'Session count',
        accent: 'green',
      },
    ],
    [loading, summary],
  );

  const classCompletion = Number(summary?.classCompletion ?? 68);
  const completionBreakdown = summary?.completionBreakdown ?? { completed: 15, inProgress: 8, notStarted: 7 };
  const activeSessions = summary?.activeSessions ?? [];
  const attentionStudents = summary?.attentionStudents ?? [];
  const performanceRows = summary?.studentPerformance ?? [];
  const recentActivity = summary?.recentActivity ?? [];
  const displayName = user?.username?.trim() || user?.full_name?.trim() || 'Teacher';

  return (
    <TeacherLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell
          sidebar={sidebar}
          onMenuClick={onMenuClick}
          title={`${displayName} Dashboard`}
          subtitle={`Welcome back, ${displayName}! Monitor your students' CyberEscape progress.`}
        >
          <div className="space-y-6 overflow-x-hidden">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {stats.map((item) => (
                <StatCard key={item.label} label={item.label} value={item.value} subtext={item.subtext} accent={item.accent} />
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
              <SectionCard
                id="students"
                title="Recent Student Activity"
                subtitle="Newest student gameplay events"
                action={<Badge tone="cyan">{loading ? 'Loading' : `${recentActivity.length} events`}</Badge>}
                className="min-h-[420px]"
              >
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="max-h-[360px] overflow-auto">
                    <table className="min-w-[900px] w-full text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-slate-950/95 text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Activity</th>
                          <th className="px-4 py-3">Room</th>
                          <th className="px-4 py-3">Difficulty</th>
                          <th className="px-4 py-3">Score</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Date/Time</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td className="px-4 py-6 text-slate-400" colSpan={8}>Loading student activity...</td>
                          </tr>
                        ) : recentActivity.length ? (
                          recentActivity.map((row) => (
                            <tr key={row.id} className="border-t border-white/10">
                              <td className="px-4 py-3 text-slate-200">{row.student_name}</td>
                              <td className="px-4 py-3 text-slate-200">{row.activity}</td>
                              <td className="px-4 py-3 text-slate-200">{row.room}</td>
                              <td className="px-4 py-3 text-slate-200">{row.difficulty ?? 'Beginner'}</td>
                              <td className="px-4 py-3 text-slate-200">{row.score ?? 0}</td>
                              <td className="px-4 py-3">
                                <Badge tone={row.status === 'Completed' ? 'green' : row.status === 'Failed' ? 'red' : row.status === 'Paused' ? 'amber' : 'cyan'}>
                                  {row.status ?? 'Playing'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-slate-300">{new Date(row.created_at).toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/15">
                                  <Eye size={14} />
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-4 py-6" colSpan={8}>
                              <EmptyState
                                message="No recent student activity yet."
                                subtext="Student gameplay activity will appear here."
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </SectionCard>

              <div className="space-y-6">
                <SectionCard
                  id="progress"
                  title="Student Progress"
                  subtitle="Overall class completion"
                  action={
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 transition hover:bg-cyan-400/15"
                    >
                      View All Progress
                      <ChevronRight size={14} />
                    </button>
                  }
                >
                  <div className="grid gap-4 sm:grid-cols-[0.92fr_1.08fr]">
                    <div className="flex items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6 text-center">
                      <div>
                        <p className="text-5xl font-black text-cyan-300">{classCompletion}%</p>
                        <p className="mt-2 text-sm text-slate-300">Overall Class Completion</p>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-slate-400">Completed</p>
                        <p className="mt-1 text-2xl font-semibold text-white">{completionBreakdown.completed}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-slate-400">In Progress</p>
                        <p className="mt-1 text-2xl font-semibold text-white">{completionBreakdown.inProgress}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-slate-400">Not Started</p>
                        <p className="mt-1 text-2xl font-semibold text-white">{completionBreakdown.notStarted}</p>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  id="attention"
                  title="Students Needing Attention"
                  subtitle="Learners who may need teacher support"
                  action={<Badge tone="amber">{attentionStudents.length ? `${attentionStudents.length} flagged` : 'None flagged'}</Badge>}
                >
                  <div className="space-y-3">
                    {loading ? (
                      <p className="text-slate-400">Loading attention list...</p>
                    ) : attentionStudents.length ? (
                      attentionStudents.map((student) => (
                        <div key={student.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-[1fr_auto]">
                          <div>
                            <p className="font-medium text-white">{student.name}</p>
                            <p className="text-sm text-slate-400">{student.room} | {student.issue}</p>
                          </div>
                          <button type="button" className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                            <UserRoundSearch size={14} />
                            View Progress
                          </button>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        message="No students need attention right now."
                        subtext="Potential issues will appear here when students fall behind."
                      />
                    )}
                  </div>
                </SectionCard>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <SectionCard id="sessions" title="Active Game Sessions" subtitle="Monitor live gameplay sessions">
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="max-h-[360px] overflow-auto">
                    <table className="min-w-[980px] w-full text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-slate-950/95 text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Current Room</th>
                          <th className="px-4 py-3">Difficulty</th>
                          <th className="px-4 py-3">Time Elapsed</th>
                          <th className="px-4 py-3">Attempts</th>
                          <th className="px-4 py-3">Hints Used</th>
                          <th className="px-4 py-3">Score</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td className="px-4 py-6 text-slate-400" colSpan={9}>Loading active sessions...</td>
                          </tr>
                        ) : activeSessions.length ? (
                          activeSessions.map((session) => (
                            <tr key={session.id} className="border-t border-white/10">
                              <td className="px-4 py-3 text-slate-200">{session.student}</td>
                              <td className="px-4 py-3 text-slate-200">{session.room}</td>
                              <td className="px-4 py-3 text-slate-200">{session.difficulty}</td>
                              <td className="px-4 py-3 text-slate-200">{session.time_elapsed}</td>
                              <td className="px-4 py-3 text-slate-200">{session.attempts}</td>
                              <td className="px-4 py-3 text-slate-200">{session.hints_used}</td>
                              <td className="px-4 py-3 text-slate-200">{session.score}</td>
                              <td className="px-4 py-3">
                                <Badge tone={session.status === 'Completed' ? 'green' : session.status === 'Paused' ? 'amber' : 'cyan'}>
                                  {session.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200">
                                  View Session
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-4 py-6" colSpan={9}>
                              <EmptyState message="No active game sessions yet." subtext="Live sessions will appear here when students start playing." />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </SectionCard>

              <SectionCard id="performance" title="Class Performance" subtitle="Monitoring overview">
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Average Score</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{loading ? '...' : `${summary?.averageScore ?? 0}%`}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Completion Rate</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{loading ? '...' : `${classCompletion}%`}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Total Attempts</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{loading ? '...' : summary?.totalAttempts ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Total Hints Used</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{loading ? '...' : summary?.hintsUsed ?? 0}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Compact Chart</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">Class performance overview</h3>
                      </div>
                      <LineChart className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                        <p className="text-sm text-slate-400">Highest Performing Room</p>
                        <p className="mt-1 text-white">Room 3</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                        <p className="text-sm text-slate-400">Most Difficult Room</p>
                        <p className="mt-1 text-white">Room 7</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                        <p className="text-sm text-slate-400">Average Completion Time</p>
                        <p className="mt-1 text-white">1h 12m</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            <SectionCard id="leaderboard" title="Leaderboard" subtitle="Ranked from actual game results">
              {loading ? (
                <p className="text-slate-400">Loading leaderboard...</p>
              ) : performanceRows.length ? (
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="max-h-[320px] overflow-auto">
                    <table className="min-w-[900px] w-full text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-slate-950/95 text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Rank</th>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Rooms Completed</th>
                          <th className="px-4 py-3">Score</th>
                          <th className="px-4 py-3">Completion Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performanceRows.map((row) => (
                          <tr key={row.id} className="border-t border-white/10">
                            <td className="px-4 py-3 text-slate-200">{row.rank}</td>
                            <td className="px-4 py-3 text-slate-200">{row.student}</td>
                            <td className="px-4 py-3 text-slate-200">{row.rooms_completed}</td>
                            <td className="px-4 py-3 text-slate-200">{row.average_score}%</td>
                            <td className="px-4 py-3 text-slate-200">{row.play_time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <EmptyState message="Leaderboard will appear once students start completing rooms." />
              )}
            </SectionCard>
          </div>
        </DashboardShell>
      )}
    </TeacherLayout>
  );
}
