import TeacherSectionPage from './TeacherSectionPage';

export default function TeacherRoomsPage() {
  return (
    <TeacherSectionPage
      title="Room Progress"
      subtitle="Track room-level progress and completion"
      endpoint="/api/dashboard/teacher/dashboard"
      emptyMessage="Room progress will appear here."
    />
  );
}
