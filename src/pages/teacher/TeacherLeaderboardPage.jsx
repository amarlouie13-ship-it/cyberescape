import TeacherSectionPage from './TeacherSectionPage';

export default function TeacherLeaderboardPage() {
  return (
    <TeacherSectionPage
      title="Leaderboard"
      subtitle="Class ranking from actual game results"
      endpoint="/api/dashboard/teacher/dashboard"
      emptyMessage="Leaderboard will appear once students start completing rooms."
    />
  );
}
