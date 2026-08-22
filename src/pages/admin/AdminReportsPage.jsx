import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import { api } from '../../services/api';

export default function AdminReportsPage() {
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    api.get('/dashboard/admin/reports').then(({ data }) => setTotals(data.totals ?? data));
  }, []);

  const cards = [
    ['Total Students', totals?.totalStudents],
    ['Total Teachers', totals?.totalTeachers],
    ['Active Players', totals?.activePlayers],
    ['Games Started', totals?.gamesStarted],
    ['Games Completed', totals?.gamesCompleted],
    ['Rooms Completed', totals?.roomsCompleted],
    ['Average Score', totals?.averageScore],
    ['Average Play Time', totals?.averagePlayTime],
    ['Average Attempts', totals?.averageAttempts],
    ['Hints Used', totals?.hintsUsed],
    ['Puzzle Success Rate', totals?.puzzleSuccessRate],
    ['Room Completion Rate', totals?.roomCompletionRate],
    ['Achievement Statistics', totals?.achievements],
    ['Leaderboard Statistics', totals?.leaderboard],
  ];

  return (
    <AdminLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell sidebar={sidebar} onMenuClick={onMenuClick} title="Admin Reports" subtitle="System-wide performance reports">
          <SectionCard title="Report Overview" subtitle="Read-only analytics">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{value ?? 'Loading...'}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </DashboardShell>
      )}
    </AdminLayout>
  );
}
