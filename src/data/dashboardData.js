export const adminOverview = {
  stats: [
    { label: 'Total Users', value: '312', subtext: 'Active accounts', accent: 'cyan' },
    { label: 'Teachers', value: '24', subtext: 'Monitoring classes', accent: 'purple' },
    { label: 'Students', value: '288', subtext: 'Registered players', accent: 'blue' },
    { label: 'Rooms', value: '8', subtext: 'CyberEscape rooms', accent: 'teal' },
    { label: 'Puzzles', value: '18', subtext: 'Validation challenges', accent: 'green' },
    { label: 'Active Players', value: '46', subtext: 'Currently in session', accent: 'amber' },
  ],
  activities: [
    ['New Student account created', 'Admin', '2 min ago'],
    ['Teacher logged into the system', 'Teacher', '8 min ago'],
    ['Student completed Room 1', 'Student', '14 min ago'],
    ['Student unlocked Room 2', 'Student', '21 min ago'],
    ['Admin updated a puzzle', 'Admin', '1 hour ago'],
  ],
  rooms: [
    ['Room 1', 'Login Security', 'Beginner', 'Active', '78%', '850'],
    ['Room 2', 'Phishing Email', 'Beginner', 'Active', '74%', '920'],
    ['Room 3', 'Password Security', 'Beginner', 'Active', '68%', '880'],
    ['Room 4', 'Malware Investigation', 'Intermediate', 'Active', '61%', '790'],
  ],
};

export const teacherOverview = {
  stats: [
    { label: 'My Students', value: '28', subtext: 'Assigned learners', accent: 'cyan' },
    { label: 'Students Playing', value: '6', subtext: 'In active sessions', accent: 'teal' },
    { label: 'Rooms Completed', value: '42', subtext: 'Cumulative completions', accent: 'blue' },
    { label: 'Average Score', value: '78%', subtext: 'Class performance', accent: 'purple' },
    { label: 'Total Plays', value: '156', subtext: 'Session count', accent: 'green' },
  ],
  activity: [
    ['Juan Dela Cruz', 'Completed Room 1', 'Login Security', '850', 'Aug 20, 2026'],
    ['Maria Santos', 'Completed Room 2', 'Phishing Email', '920', 'Aug 20, 2026'],
    ['Kyle Reyes', 'Used Hint 2', 'Password Security', '730', 'Aug 21, 2026'],
  ],
  students: [
    ['1', 'Juan Dela Cruz', '3', 'Room 4', '89%', '12', '4', '1h 25m', 'Active'],
    ['2', 'Maria Santos', '3', 'Room 4', '87%', '10', '3', '1h 18m', 'Active'],
    ['3', 'Kyle Reyes', '2', 'Room 3', '82%', '9', '2', '54m', 'Active'],
    ['4', 'Anna Lim', '2', 'Room 3', '80%', '8', '2', '48m', 'Active'],
  ],
};

export const studentOverview = {
  stats: [
    { label: 'Current Score', value: '1,250', subtext: 'Mission points', accent: 'cyan' },
    { label: 'Hints Available', value: '3', subtext: 'Unused hints', accent: 'amber' },
    { label: 'Achievements', value: '5', subtext: 'Earned badges', accent: 'green' },
    { label: 'Current Room', value: 'Room 4', subtext: 'Malware Investigation', accent: 'purple' },
  ],
  rooms: [
    ['Room 1', 'Login Security', 'Beginner', 'COMPLETED', '850'],
    ['Room 2', 'Phishing Email', 'Beginner', 'COMPLETED', '920'],
    ['Room 3', 'Password Security', 'Beginner', 'AVAILABLE', 'PLAY'],
    ['Room 4', 'Malware Investigation', 'Intermediate', 'IN PROGRESS', 'CONTINUE'],
    ['Room 5', 'Encryption Challenge', 'Intermediate', 'LOCKED', 'LOCKED'],
    ['Room 6', 'Network Security', 'Advanced', 'LOCKED', 'LOCKED'],
  ],
  achievements: ['First Escape', 'First Puzzle Solved', 'Password Master', 'Phishing Detector', 'No Hint Hero'],
};
