import { useState } from 'react';
import { LayoutDashboard, Users, Map, Puzzle, Gem, FileText, BellRing, Settings, LogOut, BarChart3, Activity, ClipboardList, Target } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import MobileDrawer from '../components/common/MobileDrawer';
import { useAuth } from '../context/AuthContext';

const sections = [
  { items: [{ label: 'Dashboard', to: '/admin/dashboard', end: true, icon: LayoutDashboard }] },
  { items: [{ label: 'User Management', to: '/admin/users', icon: Users }] },
  { items: [{ label: 'Rooms', to: '/admin/rooms', icon: Map }] },
  { items: [{ label: 'Puzzles', to: '/admin/puzzles', icon: Puzzle }] },
  { items: [{ label: 'Clues', to: '/admin/clues', icon: ClipboardList }] },
  { items: [{ label: 'Inventory', to: '/admin/inventory', icon: Gem }] },
  { items: [{ label: 'Achievements', to: '/admin/achievements', icon: Target }] },
  { items: [{ label: 'Lessons', to: '/admin/lessons', icon: FileText }] },
  {
    title: 'Monitoring',
    items: [
      { label: 'Student Progress', to: '/admin/progress', icon: Activity },
      { label: 'Game Sessions', to: '/admin/sessions', icon: Activity },
      { label: 'Scores', to: '/admin/scores', icon: BarChart3 },
      { label: 'Leaderboard', to: '/admin/leaderboard', icon: BarChart3 },
      { label: 'Activity Logs', to: '/admin/activity', icon: Activity },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Student Performance', to: '/admin/reports', icon: FileText },
      { label: 'Room Performance', to: '/admin/reports', icon: FileText },
      { label: 'Puzzle Performance', to: '/admin/reports', icon: FileText },
      { label: 'Game Analytics', to: '/admin/reports', icon: FileText },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Announcements', to: '/admin/announcements', icon: BellRing },
      { label: 'Settings', to: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const brandLabel = user?.username?.trim() || user?.full_name?.trim() || 'Admin';

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
      <div data-role="admin">{children({ sidebar, onMenuClick: () => setOpen(true), user })}</div>
    </>
  );
}
