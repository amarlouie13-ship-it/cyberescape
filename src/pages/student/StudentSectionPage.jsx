import StudentLayout from '../../layouts/StudentLayout';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';

export default function StudentSectionPage({ title, subtitle, children }) {
  return (
    <StudentLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell sidebar={sidebar} onMenuClick={onMenuClick} title={title} subtitle={subtitle}>
          <SectionCard title={title} subtitle={subtitle}>
            {children ?? <p className="text-slate-300">Your student view goes here.</p>}
          </SectionCard>
        </DashboardShell>
      )}
    </StudentLayout>
  );
}
