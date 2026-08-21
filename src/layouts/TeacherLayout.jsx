import { useState } from 'react';
import { LayoutDashboard, Users, Activity, BookOpen, BellRing, Settings, LogOut, Target, BarChart3 } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import MobileDrawer from '../components/common/MobileDrawer';
import { useAuth } from '../context/AuthContext';

const sections = [
  { title: 'Main', items: [{ label: 'Dashboard', to: '/teacher/dashboard', end: true, icon: LayoutDashboard }] },
  {
    title: 'Students',
    items: [
      { label: 'My Students', to: '/teacher/dashboard#students', icon: Users },
      { label: 'Student Progress', to: '/teacher/dashboard#progress', icon: Activity },
      { label: 'Student Performance', to: '/teacher/dashboard#performance', icon: BarChart3 },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { label: 'Game Sessions', to: '/teacher/dashboard#sessions', icon: Activity },
      { label: 'Room Progress', to: '/teacher/dashboard#rooms', icon: Target },
      { label: 'Scores', to: '/teacher/dashboard#scores', icon: BarChart3 },
      { label: 'Attempts & Hints', to: '/teacher/dashboard#attempts', icon: Activity },
      { label: 'Leaderboard', to: '/teacher/dashboard#leaderboard', icon: BarChart3 },
    ],
  },
  {
    title: 'Learning',
    items: [
      { label: 'Room Guides', to: '/teacher/dashboard#guides', icon: BookOpen },
      { label: 'Cybersecurity Lessons', to: '/teacher/dashboard#lessons', icon: BookOpen },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Student Reports', to: '/teacher/dashboard#reports', icon: BarChart3 },
      { label: 'Class Performance', to: '/teacher/dashboard#reports', icon: BarChart3 },
      { label: 'Room Performance', to: '/teacher/dashboard#reports', icon: BarChart3 },
    ],
  },
  { title: 'Communication', items: [{ label: 'Announcements', to: '/teacher/dashboard#announcements', icon: BellRing }] },
];

export default function TeacherLayout({ children }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <Sidebar
      brand="Teacher"
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
