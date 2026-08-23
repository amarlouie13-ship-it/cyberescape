import { useState } from 'react';
import { LayoutDashboard, Users, Activity, LogOut, Target, BarChart3, UserRound, FileText } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import MobileDrawer from '../components/common/MobileDrawer';
import { useAuth } from '../context/AuthContext';

const sections = [
  { title: 'Main', items: [{ label: 'Dashboard', to: '/teacher/dashboard', end: true, icon: LayoutDashboard }] },
  {
    title: 'Students',
    items: [
      { label: 'My Students', to: '/teacher/students', icon: Users },
      { label: 'Student Progress', to: '/teacher/progress', icon: Activity },
      { label: 'Student Performance', to: '/teacher/performance', icon: BarChart3 },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { label: 'Game Sessions', to: '/teacher/sessions', icon: Activity },
      { label: 'Room Progress', to: '/teacher/rooms', icon: Target },
      { label: 'Leaderboard', to: '/teacher/leaderboard', icon: BarChart3 },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Student Reports', to: '/teacher/reports', icon: FileText },
      { label: 'Class Performance', to: '/teacher/performance', icon: BarChart3 },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', to: '/teacher/profile', icon: UserRound },
    ],
  },
];

export default function TeacherLayout({ children }) {
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const brandLabel = user?.username?.trim() || user?.full_name?.trim() || 'Teacher';

  const sidebar = (
    <Sidebar
      brand={brandLabel}
      sections={sections}
      footer={
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200">
          <LogOut size={16} /> Logout
        </button>
      }
    />
  );

  return (
    <>
      <MobileDrawer open={open} onClose={() => setOpen(false)} sidebar={sidebar} />
      <div data-role="teacher">{children({ sidebar, onMenuClick: () => setOpen(true) })}</div>
    </>
  );
}
