import AdminLayout from '../../layouts/AdminLayout';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';

export default function AdminSectionPage({ title, subtitle, children }) {
  return (
    <AdminLayout>
      {({ sidebar, onMenuClick, user }) => (
        <DashboardShell sidebar={sidebar} onMenuClick={onMenuClick} title={title} subtitle={subtitle}>
          <SectionCard title={title} subtitle={subtitle}>
            {children ?? <p className="text-slate-300">Manage CyberEscape data here.</p>}
          </SectionCard>
        </DashboardShell>
      )}
    </AdminLayout>
  );
}
