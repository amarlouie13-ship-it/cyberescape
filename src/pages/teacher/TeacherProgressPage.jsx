import TeacherSectionPage from './TeacherSectionPage';

export default function TeacherProgressPage() {
  return (
    <TeacherSectionPage
      title="Student Progress"
      subtitle="Monitor overall completion and room progress"
      endpoint="/api/dashboard/teacher/dashboard"
      emptyMessage="Student progress will appear once students begin playing."
    />
  );
}
