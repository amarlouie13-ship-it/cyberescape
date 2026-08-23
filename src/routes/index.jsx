import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SplashPage = lazy(() => import('../pages/auth/SplashPage'));
const NotFoundPage = lazy(() => import('../pages/common/NotFoundPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminSectionPage = lazy(() => import('../pages/admin/AdminSectionPage'));
const AdminTeachersPage = lazy(() => import('../pages/admin/AdminTeachersPage'));
const AdminStudentsPage = lazy(() => import('../pages/admin/AdminStudentsPage'));
const TeacherDashboard = lazy(() => import('../pages/teacher/TeacherDashboard'));
const TeacherStudentsPage = lazy(() => import('../pages/teacher/TeacherStudentsPage'));
const TeacherProgressPage = lazy(() => import('../pages/teacher/TeacherProgressPage'));
const TeacherPerformancePage = lazy(() => import('../pages/teacher/TeacherPerformancePage'));
const TeacherSessionsPage = lazy(() => import('../pages/teacher/TeacherSessionsPage'));
const TeacherRoomsPage = lazy(() => import('../pages/teacher/TeacherRoomsPage'));
const TeacherLeaderboardPage = lazy(() => import('../pages/teacher/TeacherLeaderboardPage'));
const TeacherProfilePage = lazy(() => import('../pages/teacher/TeacherProfilePage'));
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const StudentSectionPage = lazy(() => import('../pages/student/StudentSectionPage'));
const RoomsHubPage = lazy(() => import('../pages/game/RoomsHubPage'));
const RoomPage = lazy(() => import('../pages/game/RoomPage'));
const RoomManagementPage = lazy(() => import('../pages/admin/RoomManagementPage'));
const PuzzleManagementPage = lazy(() => import('../pages/admin/PuzzleManagementPage'));
const AddUserPage = lazy(() => import('../pages/admin/AddUserPage'));
const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage'));
const TeacherReportsPage = lazy(() => import('../pages/teacher/TeacherReportsPage'));

export const appRoutes = [
  { path: '/auth/splash', element: <SplashPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/login', element: <LoginPage /> },
  {
    path: '/admin/dashboard',
    element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>,
  },
  {
    path: '/admin/rooms',
    element: <ProtectedRoute allowedRoles={['admin']}><RoomManagementPage /></ProtectedRoute>,
  },
  { path: '/admin/teachers', element: <ProtectedRoute allowedRoles={['admin']}><AdminTeachersPage /></ProtectedRoute> },
  { path: '/admin/students', element: <ProtectedRoute allowedRoles={['admin']}><AdminStudentsPage /></ProtectedRoute> },
  { path: '/admin/clues', element: <ProtectedRoute allowedRoles={['admin']}><AdminSectionPage title="Clues" subtitle="Review clue content" /></ProtectedRoute> },
  { path: '/admin/inventory', element: <ProtectedRoute allowedRoles={['admin']}><AdminSectionPage title="Inventory" subtitle="Review inventory items" /></ProtectedRoute> },
  { path: '/admin/achievements', element: <ProtectedRoute allowedRoles={['admin']}><AdminSectionPage title="Achievements" subtitle="Review achievement rules" /></ProtectedRoute> },
  { path: '/admin/lessons', element: <ProtectedRoute allowedRoles={['admin']}><AdminSectionPage title="Lessons" subtitle="Review lesson content" /></ProtectedRoute> },
  { path: '/admin/progress', element: <ProtectedRoute allowedRoles={['admin']}><AdminSectionPage title="Student Progress" subtitle="Track class progress" /></ProtectedRoute> },
  { path: '/admin/sessions', element: <ProtectedRoute allowedRoles={['admin']}><AdminSectionPage title="Game Sessions" subtitle="Monitor active sessions" /></ProtectedRoute> },
  { path: '/admin/scores', element: <ProtectedRoute allowedRoles={['admin']}><AdminSectionPage title="Scores" subtitle="Review score data" /></ProtectedRoute> },
  { path: '/admin/leaderboard', element: <ProtectedRoute allowedRoles={['admin']}><AdminSectionPage title="Leaderboard" subtitle="Rank student performance" /></ProtectedRoute> },
  { path: '/admin/activity', element: <ProtectedRoute allowedRoles={['admin']}><AdminSectionPage title="Activity Logs" subtitle="Review system activity" /></ProtectedRoute> },
  { path: '/admin/announcements', element: <ProtectedRoute allowedRoles={['admin']}><AdminSectionPage title="Announcements" subtitle="Broadcast messages" /></ProtectedRoute> },
  { path: '/admin/settings', element: <ProtectedRoute allowedRoles={['admin']}><AdminSectionPage title="Settings" subtitle="System configuration" /></ProtectedRoute> },
  {
    path: '/admin/users',
    element: <ProtectedRoute allowedRoles={['admin']}><AddUserPage /></ProtectedRoute>,
  },
  {
    path: '/admin/puzzles',
    element: <ProtectedRoute allowedRoles={['admin']}><PuzzleManagementPage /></ProtectedRoute>,
  },
  {
    path: '/admin/reports',
    element: <ProtectedRoute allowedRoles={['admin']}><AdminReportsPage /></ProtectedRoute>,
  },
  {
    path: '/teacher/dashboard',
    element: <ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>,
  },
  {
    path: '/teacher/students',
    element: <ProtectedRoute allowedRoles={['teacher']}><TeacherStudentsPage /></ProtectedRoute>,
  },
  {
    path: '/teacher/progress',
    element: <ProtectedRoute allowedRoles={['teacher']}><TeacherProgressPage /></ProtectedRoute>,
  },
  {
    path: '/teacher/performance',
    element: <ProtectedRoute allowedRoles={['teacher']}><TeacherPerformancePage /></ProtectedRoute>,
  },
  {
    path: '/teacher/sessions',
    element: <ProtectedRoute allowedRoles={['teacher']}><TeacherSessionsPage /></ProtectedRoute>,
  },
  {
    path: '/teacher/rooms',
    element: <ProtectedRoute allowedRoles={['teacher']}><TeacherRoomsPage /></ProtectedRoute>,
  },
  {
    path: '/teacher/leaderboard',
    element: <ProtectedRoute allowedRoles={['teacher']}><TeacherLeaderboardPage /></ProtectedRoute>,
  },
  {
    path: '/teacher/profile',
    element: <ProtectedRoute allowedRoles={['teacher']}><TeacherProfilePage /></ProtectedRoute>,
  },
  {
    path: '/teacher/reports',
    element: <ProtectedRoute allowedRoles={['teacher']}><TeacherReportsPage /></ProtectedRoute>,
  },
  {
    path: '/student/dashboard',
    element: <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>,
  },
  { path: '/student/progress', element: <ProtectedRoute allowedRoles={['student']}><StudentSectionPage title="My Progress" subtitle="Track your mission progress" /></ProtectedRoute> },
  { path: '/student/rooms', element: <ProtectedRoute allowedRoles={['student']}><StudentSectionPage title="Rooms" subtitle="Choose your next room" /></ProtectedRoute> },
  { path: '/student/inventory', element: <ProtectedRoute allowedRoles={['student']}><StudentSectionPage title="Inventory" subtitle="Collected items and evidence" /></ProtectedRoute> },
  { path: '/student/leaderboard', element: <ProtectedRoute allowedRoles={['student']}><StudentSectionPage title="Leaderboard" subtitle="See class rankings" /></ProtectedRoute> },
  { path: '/student/achievements', element: <ProtectedRoute allowedRoles={['student']}><StudentSectionPage title="Achievements" subtitle="Earned badges and milestones" /></ProtectedRoute> },
  { path: '/student/lessons', element: <ProtectedRoute allowedRoles={['student']}><StudentSectionPage title="Lessons Learned" subtitle="Review completed lessons" /></ProtectedRoute> },
  { path: '/student/profile', element: <ProtectedRoute allowedRoles={['student']}><StudentSectionPage title="Profile" subtitle="Your account details" /></ProtectedRoute> },
  { path: '/student/settings', element: <ProtectedRoute allowedRoles={['student']}><StudentSectionPage title="Settings" subtitle="Personal preferences" /></ProtectedRoute> },
  {
    path: '/game/rooms',
    element: <ProtectedRoute allowedRoles={['student']}><RoomsHubPage /></ProtectedRoute>,
  },
  {
    path: '/game/rooms/:roomId',
    element: <ProtectedRoute allowedRoles={['student']}><RoomPage /></ProtectedRoute>,
  },
  { path: '/404', element: <NotFoundPage /> },
];
