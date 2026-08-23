import TeacherSectionPage from './TeacherSectionPage';

export default function TeacherStudentsPage() {
  return (
    <TeacherSectionPage
      title="My Students"
      subtitle="View assigned learners and their status"
      endpoint="/api/dashboard/teacher/dashboard"
      emptyMessage="No students assigned yet."
    />
  );
}
