import { useState } from 'react';
import { LayoutDashboard, Trophy, Boxes, Gem, BookOpen, User, Settings, LogOut, BarChart3 } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import MobileDrawer from '../components/common/MobileDrawer';
import { useAuth } from '../context/AuthContext';

const sections = [
  { title: 'Main', items: [{ label: 'Dashboard', to: '/student/dashboard', end: true, icon: LayoutDashboard }] },
  {
    title: 'Player',
    items: [
      { label: 'My Progress', to: '/student/dashboard#progress', icon: BarChart3 },
      { label: 'Rooms', to: '/student/dashboard#rooms', icon: Boxes },
      { label: 'Inventory', to: '/student/dashboard#inventory', icon: Gem },
      { label: 'Leaderboard', to: '/student/dashboard#leaderboard', icon: Trophy },
      { label: 'Achievements', to: '/student/dashboard#achievements', icon: Trophy },
      { label: 'Lessons Learned', to: '/student/dashboard#lessons', icon: BookOpen },
      { label: 'Profile', to: '/student/dashboard#profile', icon: User },
      { label: 'Settings', to: '/student/dashboard#settings', icon: Settings },
    ],
  },
];

export default function StudentLayout({ children }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <Sidebar
      brand="Student"
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
      <div data-role="student">{children({ sidebar, onMenuClick: () => setOpen(true) })}</div>
    </>
  );
}
