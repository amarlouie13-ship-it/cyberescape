import { useState } from 'react';
import { LayoutDashboard, Users, Shield, Map, Puzzle, Gem, FileText, BellRing, Settings, LogOut, BarChart3, Activity, ClipboardList, Target } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import MobileDrawer from '../components/common/MobileDrawer';
import { useAuth } from '../context/AuthContext';

const sections = [
  { title: 'Main', items: [{ label: 'Dashboard', to: '/admin/dashboard', end: true, icon: LayoutDashboard }] },
  {
    title: 'User Management',
    items: [
      { label: 'Teachers', to: '/admin/dashboard#teachers', icon: Users },
      { label: 'Students', to: '/admin/dashboard#students', icon: Shield },
      { label: 'User Management', to: '/admin/dashboard#users', icon: Users },
    ],
  },
  {
    title: 'Game Management',
    items: [
      { label: 'Rooms', to: '/admin/dashboard#rooms', icon: Map },
      { label: 'Puzzles', to: '/admin/dashboard#puzzles', icon: Puzzle },
      { label: 'Clues', to: '/admin/dashboard#clues', icon: ClipboardList },
      { label: 'Inventory', to: '/admin/dashboard#inventory', icon: Gem },
      { label: 'Achievements', to: '/admin/dashboard#achievements', icon: Target },
      { label: 'Lessons', to: '/admin/dashboard#lessons', icon: FileText },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { label: 'Student Progress', to: '/admin/dashboard#progress', icon: Activity },
      { label: 'Game Sessions', to: '/admin/dashboard#sessions', icon: Activity },
      { label: 'Scores', to: '/admin/dashboard#scores', icon: BarChart3 },
      { label: 'Leaderboard', to: '/admin/dashboard#leaderboard', icon: BarChart3 },
      { label: 'Activity Logs', to: '/admin/dashboard#activity', icon: Activity },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Student Performance', to: '/admin/dashboard#reports', icon: FileText },
      { label: 'Room Performance', to: '/admin/dashboard#reports', icon: FileText },
      { label: 'Puzzle Performance', to: '/admin/dashboard#reports', icon: FileText },
      { label: 'Game Analytics', to: '/admin/dashboard#reports', icon: FileText },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Announcements', to: '/admin/dashboard#announcements', icon: BellRing },
      { label: 'Settings', to: '/admin/dashboard#settings', icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <Sidebar
      brand="Admin"
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
