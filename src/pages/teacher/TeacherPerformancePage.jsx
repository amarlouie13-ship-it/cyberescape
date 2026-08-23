import TeacherSectionPage from './TeacherSectionPage';

export default function TeacherPerformancePage() {
  return (
    <TeacherSectionPage
      title="Student Performance"
      subtitle="Compare scores, attempts, and completion"
      endpoint="/api/dashboard/teacher/dashboard"
      emptyMessage="Performance analytics will appear when students have gameplay data."
    />
  );
}
