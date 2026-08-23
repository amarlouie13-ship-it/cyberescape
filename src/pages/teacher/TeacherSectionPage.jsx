import TeacherLayout from '../../layouts/TeacherLayout';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import { api } from '../../services/api';
import { useEffect, useState } from 'react';

export default function TeacherSectionPage({ title, subtitle, endpoint, emptyMessage, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get(endpoint).then(({ data: response }) => {
      if (mounted) setData(response);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [endpoint]);

  return (
    <TeacherLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell sidebar={sidebar} onMenuClick={onMenuClick} title={title} subtitle={subtitle}>
          <SectionCard title={title} subtitle={subtitle}>
            {children ? children({ data, loading }) : (
              <div className="text-slate-300">{loading ? 'Loading...' : emptyMessage || 'No data available.'}</div>
            )}
          </SectionCard>
        </DashboardShell>
      )}
    </TeacherLayout>
  );
}
