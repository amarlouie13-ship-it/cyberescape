import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SplashPage = lazy(() => import('../pages/auth/SplashPage'));
const NotFoundPage = lazy(() => import('../pages/common/NotFoundPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const TeacherDashboard = lazy(() => import('../pages/teacher/TeacherDashboard'));
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const RoomsHubPage = lazy(() => import('../pages/game/RoomsHubPage'));
const RoomPage = lazy(() => import('../pages/game/RoomPage'));
const RoomManagementPage = lazy(() => import('../pages/admin/RoomManagementPage'));
const PuzzleManagementPage = lazy(() => import('../pages/admin/PuzzleManagementPage'));
const AddUserPage = lazy(() => import('../pages/admin/AddUserPage'));
const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage'));
const TeacherReportsPage = lazy(() => import('../pages/teacher/TeacherReportsPage'));

export const appRoutes = [
  { path: '/auth/splash', element: <SplashPage /> },
  { path: '/auth/login', element: <LoginPage /> },
  {
    path: '/admin/dashboard',
    element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>,
  },
  {
    path: '/admin/rooms',
    element: <ProtectedRoute allowedRoles={['admin']}><RoomManagementPage /></ProtectedRoute>,
  },
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
    path: '/teacher/reports',
    element: <ProtectedRoute allowedRoles={['teacher']}><TeacherReportsPage /></ProtectedRoute>,
  },
  {
    path: '/student/dashboard',
    element: <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>,
  },
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
