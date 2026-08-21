import { useEffect, useState } from 'react';
import TeacherLayout from '../../layouts/TeacherLayout';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import { api } from '../../services/api';

export default function TeacherReportsPage() {
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    api.get('/api/dashboard/teacher/reports').then(({ data }) => setTotals(data.totals ?? data));
  }, []);

  const cards = [
    ['Student Progress Report', totals?.studentProgressReport],
    ['Student Score Report', totals?.studentScoreReport],
    ['Room Completion Report', totals?.roomCompletionReport],
    ['Attempts Report', totals?.attemptsReport],
    ['Hints Report', totals?.hintsReport],
    ['Class Performance Report', totals?.classPerformanceReport],
    ['Game History Report', totals?.gameHistoryReport],
  ];

  return (
    <TeacherLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell sidebar={sidebar} onMenuClick={onMenuClick} title="Teacher Reports" subtitle="Read-only student and class reports">
          <SectionCard title="Report Overview" subtitle="Read-only analytics">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
    </TeacherLayout>
  );
}
