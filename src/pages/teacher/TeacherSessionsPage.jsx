import TeacherSectionPage from './TeacherSectionPage';

export default function TeacherSessionsPage() {
  return (
    <TeacherSectionPage
      title="Game Sessions"
      subtitle="Monitor active and recent gameplay sessions"
      endpoint="/api/dashboard/teacher/dashboard"
      emptyMessage="No active sessions yet."
    />
  );
}
