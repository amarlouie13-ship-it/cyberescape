import TeacherSectionPage from './TeacherSectionPage';

export default function TeacherProfilePage() {
  return (
    <TeacherSectionPage
      title="Profile"
      subtitle="Teacher account information"
      endpoint="/api/dashboard/teacher/dashboard"
      emptyMessage="Profile details are unavailable."
    />
  );
}
