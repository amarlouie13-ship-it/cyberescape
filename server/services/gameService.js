import { supabaseAdmin } from '../config/supabase.js';
import { calculateFinalScore, normalizeText } from '../utils/gameMath.js';
import { computeUnlockStatus } from '../utils/roomUnlock.js';
import { getRoomDefinition } from '../utils/roomContent.js';

const fallbackRooms = [
  { id: 'room-1', room_number: 1, title: 'Login Security', topic: 'Password Security / Secure Login', difficulty: 'Beginner', order_number: 1 },
  { id: 'room-2', room_number: 2, title: 'Phishing Email', topic: 'Phishing Detection', difficulty: 'Beginner', order_number: 2 },
  { id: 'room-3', room_number: 3, title: 'Password Security', topic: 'Password Security', difficulty: 'Beginner', order_number: 3 },
  { id: 'room-4', room_number: 4, title: 'Malware Investigation', topic: 'Malware Awareness', difficulty: 'Intermediate', order_number: 4 },
  { id: 'room-5', room_number: 5, title: 'Encryption Challenge', topic: 'Encryption', difficulty: 'Intermediate', order_number: 5 },
  { id: 'room-6', room_number: 6, title: 'Network Security', topic: 'Network Security', difficulty: 'Advanced', order_number: 6 },
  { id: 'room-7', room_number: 7, title: 'Incident Response', topic: 'Incident Response', difficulty: 'Advanced', order_number: 7 },
  { id: 'room-8', room_number: 8, title: 'Final CyberEscape', topic: 'Capstone Cybersecurity Challenge', difficulty: 'Advanced', order_number: 8 },
];

const fallbackPuzzles = {
  'room-1': {
    id: 'puzzle-1',
    room_id: 'room-1',
    title: 'Secure Login',
    puzzle_type: 'password_rule',
    question: 'Create a secure password that passes all rules.',
    instructions: 'At least 8 characters with uppercase, lowercase, number, and special character.',
    base_score: 1000,
    attempt_penalty: 50,
  },
};

export async function fetchRoomsWithStatus(profileId) {
  if (!supabaseAdmin) {
    return computeUnlockStatus(fallbackRooms, [
      { room_id: 'room-1', status: 'available' },
    ]);
  }

  const [roomsRes, studentRes] = await Promise.all([
    supabaseAdmin.from('rooms').select('*').order('order_number', { ascending: true }),
    supabaseAdmin
      .from('room_progress')
      .select('room_id, status, student_id')
      .eq('student_id', profileId),
  ]);

  const rooms = roomsRes.data ?? [];
  const progress = studentRes.data ?? [];
  return computeUnlockStatus(rooms, progress);
}

export async function loadRoomPayload(roomId) {
  if (!supabaseAdmin) {
    const room = fallbackRooms.find((item) => item.id === roomId || String(item.room_number) === String(roomId));
    const definition = getRoomDefinition(room?.id ?? roomId);
    return {
      room,
      puzzles:
        definition
          ? [
              {
                id: `${definition.roomNumber}-puzzle`,
                room_id: room?.id ?? roomId,
                title: definition.puzzleTitle,
                puzzle_type: definition.puzzleType,
                question: definition.puzzleQuestion,
                instructions: definition.instructions,
                base_score: 1000,
                attempt_penalty: 50,
              },
            ]
          : [],
      clues: definition?.clues?.map((clue, index) => ({
        id: `${roomId}-clue-${index}`,
        title: `Clue ${index + 1}`,
        description: clue,
        clue_type: 'text',
      })) ?? [],
      inventory: definition?.inventory?.map((item, index) => ({
        id: `${roomId}-item-${index}`,
        name: item,
        description: `${item} collected in this room.`,
        item_type: 'evidence',
      })) ?? [],
      lessons: definition ? [{ title: 'Lesson Learned', content: definition.lesson }] : [],
      definition,
    };
  }

  const [roomRes, puzzleRes, cluesRes, inventoryRes, lessonsRes] = await Promise.all([
    supabaseAdmin.from('rooms').select('*').eq('id', roomId).maybeSingle(),
    supabaseAdmin.from('puzzles').select('*').eq('room_id', roomId).order('order_number', { ascending: true }),
    supabaseAdmin.from('clues').select('*').eq('room_id', roomId),
    supabaseAdmin.from('inventory_items').select('*').eq('room_id', roomId),
    supabaseAdmin.from('lessons').select('*, puzzles!inner(room_id)').eq('puzzles.room_id', roomId),
  ]);

  return {
    room: roomRes.data ?? null,
    puzzles: puzzleRes.data ?? [],
    clues: cluesRes.data ?? [],
    inventory: inventoryRes.data ?? [],
    lessons: lessonsRes.data ?? [],
    definition: getRoomDefinition(roomId),
  };
}

export function validatePuzzleAnswer(puzzle, submittedAnswer, rules = [], options = []) {
  const answer = normalizeText(submittedAnswer);

  if (!puzzle) {
    return { isCorrect: false, reason: 'Puzzle not found.' };
  }

  if (puzzle.puzzle_type === 'multiple_choice') {
    const correctOption = options.find((item) => item.is_correct);
    return {
      isCorrect: normalizeText(correctOption?.option_text) === answer,
      reason: 'Multiple choice comparison completed.',
    };
  }

  if (puzzle.puzzle_type === 'multiple_selection') {
    const submitted = Array.isArray(submittedAnswer)
      ? submittedAnswer.map(normalizeText).sort().join('|')
      : answer;
    const expected = options.filter((item) => item.is_correct).map((item) => normalizeText(item.option_text)).sort().join('|');
    return {
      isCorrect: submitted === expected,
      reason: 'Multiple selection comparison completed.',
    };
  }

  if (puzzle.puzzle_type === 'ordered_steps') {
    const submitted = Array.isArray(submittedAnswer)
      ? submittedAnswer.map(normalizeText).join('|')
      : answer;
    const expected = rules
      .filter((rule) => rule.rule_type === 'ordered_step')
      .sort((a, b) => a.rule_order - b.rule_order)
      .map((rule) => normalizeText(rule.rule_value))
      .join('|');
    return { isCorrect: submitted === expected, reason: 'Ordered step comparison completed.' };
  }

  if (puzzle.puzzle_type === 'password_rule') {
    const lower = String(submittedAnswer || '');
    const checks = {
      min_length: lower.length >= Number(rules.find((r) => r.rule_key === 'min_length')?.rule_value ?? 0),
      uppercase: /[A-Z]/.test(lower),
      lowercase: /[a-z]/.test(lower),
      number: /\d/.test(lower),
      special: /[^A-Za-z0-9]/.test(lower),
    };
    const requiredRules = new Set(rules.map((rule) => rule.rule_key));
    const isCorrect = [...requiredRules].every((key) => checks[key] !== false);
    return { isCorrect, reason: 'Password policy validation completed.' };
  }

  if (puzzle.puzzle_type === 'cipher') {
    const expected = normalizeText(rules.find((rule) => rule.rule_key === 'expected_answer')?.rule_value ?? '');
    return { isCorrect: answer === expected, reason: 'Cipher text comparison completed.' };
  }

  const exactRule = rules.find((rule) => rule.rule_type === 'exact_answer');
  const expected = normalizeText(exactRule?.rule_value ?? '');
  return { isCorrect: answer === expected, reason: 'Exact answer comparison completed.' };
}

export async function recordAttempt({
  studentId,
  roomId,
  puzzleId,
  submittedAnswer,
  attemptNumber,
  isCorrect,
}) {
  if (!supabaseAdmin) {
    return { id: `${puzzleId}-${attemptNumber}`, submitted_answer: submittedAnswer, attempt_number: attemptNumber, is_correct: isCorrect };
  }

  const { data, error } = await supabaseAdmin
    .from('attempts')
    .insert({
      student_id: studentId,
      room_id: roomId,
      puzzle_id: puzzleId,
      submitted_answer: JSON.stringify(submittedAnswer),
      attempt_number: attemptNumber,
      is_correct: isCorrect,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function ensurePuzzlesAndRules(roomId) {
  if (!supabaseAdmin) {
    const definition = getRoomDefinition(roomId);
    return {
      room: definition,
      puzzle: definition
        ? {
            id: `${definition.roomNumber}-puzzle`,
            room_id: roomId,
            title: definition.puzzleTitle,
            puzzle_type: definition.puzzleType,
            question: definition.puzzleQuestion,
            instructions: definition.instructions,
            base_score: 1000,
            attempt_penalty: 50,
          }
        : null,
      rules: [],
      options: [],
    };
  }

  const puzzleRes = await supabaseAdmin
    .from('puzzles')
    .select('*')
    .eq('room_id', roomId)
    .order('order_number', { ascending: true })
    .limit(1)
    .maybeSingle();

  const puzzleId = puzzleRes.data?.id ?? roomId;

  const [rulesRes, optionsRes] = await Promise.all([
    supabaseAdmin.from('validation_rules').select('*').eq('puzzle_id', puzzleId).order('rule_order', { ascending: true }),
    supabaseAdmin.from('puzzle_options').select('*').eq('puzzle_id', puzzleId).order('order_number', { ascending: true }),
  ]);

  return {
    puzzle: puzzleRes.data ?? null,
    rules: rulesRes.data ?? [],
    options: optionsRes.data ?? [],
  };
}

async function loadAchievementDefinitions() {
  if (!supabaseAdmin) {
    return [
      { id: 'first-escape', name: 'First Escape', condition_type: 'rooms_completed', condition_value: '1', description: 'Complete your first room.', icon: 'KeyRound' },
      { id: 'first-puzzle', name: 'First Puzzle Solved', condition_type: 'puzzles_solved', condition_value: '1', description: 'Solve your first puzzle.', icon: 'Puzzle' },
      { id: 'password-master', name: 'Password Master', condition_type: 'room_completed', condition_value: '1', description: 'Complete Room 1.', icon: 'ShieldCheck' },
      { id: 'phishing-detector', name: 'Phishing Detector', condition_type: 'room_completed', condition_value: '2', description: 'Complete Room 2.', icon: 'MailWarning' },
      { id: 'malware-hunter', name: 'Malware Hunter', condition_type: 'room_completed', condition_value: '4', description: 'Complete Room 4.', icon: 'ScanEye' },
      { id: 'cipher-solver', name: 'Cipher Solver', condition_type: 'room_completed', condition_value: '5', description: 'Complete Room 5.', icon: 'Languages' },
      { id: 'network-defender', name: 'Network Defender', condition_type: 'room_completed', condition_value: '6', description: 'Complete Room 6.', icon: 'Network' },
      { id: 'incident-responder', name: 'Incident Responder', condition_type: 'room_completed', condition_value: '7', description: 'Complete Room 7.', icon: 'AlarmCheck' },
      { id: 'no-hint-hero', name: 'No Hint Hero', condition_type: 'hints_used', condition_value: '0', description: 'Finish without using hints.', icon: 'BadgeCheck' },
      { id: 'champion', name: 'CyberEscape Champion', condition_type: 'rooms_completed', condition_value: '8', description: 'Complete all 8 rooms.', icon: 'Crown' },
    ];
  }

  const { data } = await supabaseAdmin.from('achievements').select('*');
  return data ?? [];
}

export async function evaluateAndAwardAchievements(studentId, stats = {}) {
  const achievements = await loadAchievementDefinitions();

  const existingRes = supabaseAdmin
    ? await supabaseAdmin.from('student_achievements').select('achievement_id').eq('student_id', studentId)
    : { data: [] };
  const existing = new Set((existingRes.data ?? []).map((row) => row.achievement_id));
  const earned = [];

  const meets = (achievement) => {
    const value = Number(achievement.condition_value);
    switch (achievement.condition_type) {
      case 'rooms_completed':
        return Number(stats.roomsCompleted ?? 0) >= value;
      case 'puzzles_solved':
        return Number(stats.puzzlesSolved ?? 0) >= value;
      case 'room_completed':
        return (stats.completedRoomNumbers ?? []).includes(value);
      case 'hints_used':
        return Number(stats.hintsUsed ?? 0) <= value;
      default:
        return false;
    }
  };

  for (const achievement of achievements) {
    if (existing.has(achievement.id)) continue;
    if (!meets(achievement)) continue;

    earned.push(achievement);
    if (supabaseAdmin) {
      await supabaseAdmin.from('student_achievements').insert({
        student_id: studentId,
        achievement_id: achievement.id,
      });
    }
  }

  return earned;
}

async function persistRoomProgress({
  studentId,
  roomId,
  scoreEarned,
  isCorrect,
  attempts,
  hintsUsed,
}) {
  if (!supabaseAdmin) {
    return { room_completed: isCorrect, score: scoreEarned };
  }

  const completionStatus = isCorrect ? 'completed' : 'in_progress';
  const [roomRes] = await Promise.all([
    supabaseAdmin
      .from('room_progress')
      .upsert({
        student_id: studentId,
        room_id: roomId,
        status: completionStatus,
        score: scoreEarned,
        attempts,
        hints_used: hintsUsed,
        completed_at: isCorrect ? new Date().toISOString() : null,
        started_at: new Date().toISOString(),
      }, { onConflict: 'student_id,room_id' }),
  ]);

  if (isCorrect) {
    await supabaseAdmin.from('scores').insert({
      student_id: studentId,
      room_id: roomId,
      score: scoreEarned,
      created_at: new Date().toISOString(),
    });
  }

  return roomRes;
}

export async function submitPuzzleAnswer({
  studentId,
  roomId,
  puzzleId,
  submittedAnswer,
}) {
  const payload = await loadRoomPayload(roomId);
  const { puzzle, rules, options } = supabaseAdmin
    ? await ensurePuzzlesAndRules(roomId)
    : {
        puzzle: payload.puzzles.find((item) => item.id === puzzleId),
        rules: [],
        options: [],
      };

  const validation = validatePuzzleAnswer(puzzle, submittedAnswer, rules, options);

  let attempts = 1;
  if (supabaseAdmin) {
    const progressRes = await supabaseAdmin
      .from('puzzle_progress')
      .select('attempts, hints_used')
      .eq('student_id', studentId)
      .eq('puzzle_id', puzzleId)
      .maybeSingle();
    attempts = (progressRes.data?.attempts ?? 0) + 1;
  }

  await recordAttempt({
    studentId,
    roomId,
    puzzleId,
    submittedAnswer,
    attemptNumber: attempts,
    isCorrect: validation.isCorrect,
  });

  if (!validation.isCorrect) {
    return {
      correct: false,
      attemptsRemaining: 3 - attempts,
      feedback: 'Review the evidence and try again.',
      lesson: 'Check the puzzle rules carefully and look for the cybersecurity clue that points to the right answer.',
      scoreEarned: 0,
    };
  }

  const wrongAttempts = Math.max(0, attempts - 1);
  const scoreEarned = calculateFinalScore({
    baseScore: puzzle?.base_score ?? 1000,
    completionTimeSeconds: 0,
    wrongAttempts,
    hintsUsed: 0,
    difficulty: payload.room?.difficulty ?? 'Beginner',
  });

  if (supabaseAdmin) {
    await persistRoomProgress({
      studentId,
      roomId,
      scoreEarned,
      isCorrect: true,
      attempts,
      hintsUsed: 0,
    });

    const completedRoomsRes = await supabaseAdmin
      .from('room_progress')
      .select('room_id, status')
      .eq('student_id', studentId);
    const completedRoomNumbers = (completedRoomsRes.data ?? [])
      .filter((row) => row.status === 'completed')
      .map((row) => Number(String(row.room_id).match(/\d+/)?.[0] ?? 0));

    const earned = await evaluateAndAwardAchievements(studentId, {
      roomsCompleted: completedRoomNumbers.length,
      puzzlesSolved: completedRoomNumbers.length,
      completedRoomNumbers,
      hintsUsed: 0,
    });

    return {
      correct: true,
      attemptsRemaining: Math.max(0, 3 - attempts),
      feedback: 'You solved the puzzle.',
      lesson: 'This answer is safe because it follows the security rule set for this room.',
      scoreEarned,
      achievementsEarned: earned.map((item) => item.name),
    };
  }

  return {
    correct: true,
    attemptsRemaining: Math.max(0, 3 - attempts),
    feedback: 'You solved the puzzle.',
    lesson: 'This answer is safe because it follows the security rule set for this room.',
    scoreEarned,
    achievementsEarned: [],
  };
}

export async function loadStudentProgress(studentId) {
  if (!supabaseAdmin) {
    return {
      totalRoomsCompleted: 3,
      totalScore: 1250,
      totalAttempts: 12,
      hintsUsed: 3,
      achievements: 5,
      currentRoom: 4,
      progressPercent: 35,
      achievementNames: ['First Escape', 'First Puzzle Solved', 'Password Master', 'Phishing Detector', 'No Hint Hero'],
      rooms: [
        { room: 'Room 1', name: 'Login Security', difficulty: 'Beginner', status: 'COMPLETED', action: '850' },
        { room: 'Room 2', name: 'Phishing Email', difficulty: 'Beginner', status: 'COMPLETED', action: '920' },
        { room: 'Room 3', name: 'Password Security', difficulty: 'Beginner', status: 'AVAILABLE', action: 'PLAY' },
        { room: 'Room 4', name: 'Malware Investigation', difficulty: 'Intermediate', status: 'IN PROGRESS', action: 'CONTINUE' },
      ],
    };
  }

  const [roomProgressRes, scoreRes, achievementsRes, sessionRes] = await Promise.all([
    supabaseAdmin.from('room_progress').select('*').eq('student_id', studentId),
    supabaseAdmin.from('scores').select('score').eq('student_id', studentId),
    supabaseAdmin.from('student_achievements').select('*').eq('student_id', studentId),
    supabaseAdmin.from('game_sessions').select('*').eq('student_id', studentId).maybeSingle(),
  ]);

  const completedRooms = roomProgressRes.data?.filter((row) => row.status === 'completed').length ?? 0;
  const totalRooms = 8;
  const totalScore = scoreRes.data?.reduce((sum, row) => sum + Number(row.score || 0), 0) ?? 0;
  const achievements = achievementsRes.data ?? [];
  const rooms = await supabaseAdmin.from('rooms').select('*').order('order_number', { ascending: true });
  return {
    totalRoomsCompleted: completedRooms,
    totalScore,
    totalAttempts: roomProgressRes.data?.reduce((sum, row) => sum + Number(row.attempts || 0), 0) ?? 0,
    hintsUsed: roomProgressRes.data?.reduce((sum, row) => sum + Number(row.hints_used || 0), 0) ?? 0,
    achievements: achievements.length,
    currentRoom: sessionRes.data?.current_room_id ?? null,
    progressPercent: Math.round((completedRooms / totalRooms) * 100),
    achievementNames: achievements.map((row) => row.name),
    rooms: (rooms.data ?? []).map((room, index) => ({
      room: `Room ${room.room_number}`,
      name: room.title,
      difficulty: room.difficulty,
      status:
        index < completedRooms ? 'COMPLETED' : index === completedRooms ? 'AVAILABLE' : 'LOCKED',
      action: index < completedRooms ? String(scoreRes.data?.[index]?.score ?? 0) : index === completedRooms ? 'PLAY' : 'LOCKED',
    })),
  };
}

export async function buildAdminDashboardSummary() {
  if (!supabaseAdmin) {
    return {
      totalUsers: 312,
      teachers: 24,
      students: 288,
      rooms: 8,
      puzzles: 18,
      activePlayers: 46,
      achievementBadges: ['First Escape', 'Password Master', 'Phishing Detector', 'Malware Hunter', 'CyberEscape Champion'],
      activity: [
        { id: '1', action: 'New Student account created', module: 'Admin', created_at: new Date().toISOString() },
        { id: '2', action: 'Teacher logged into the system', module: 'Teacher', created_at: new Date().toISOString() },
      ],
    };
  }

  const [profilesRes, roomsRes, puzzlesRes, activeRes, activityRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('role, status'),
    supabaseAdmin.from('rooms').select('id'),
    supabaseAdmin.from('puzzles').select('id'),
    supabaseAdmin.from('game_sessions').select('id').eq('status', 'active'),
    supabaseAdmin.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(10),
  ]);
  const achievementsRes = await supabaseAdmin.from('achievements').select('name').order('name', { ascending: true });

  const profiles = profilesRes.data ?? [];
  return {
    totalUsers: profiles.filter((row) => row.status === 'active').length,
    teachers: profiles.filter((row) => row.role === 'teacher').length,
    students: profiles.filter((row) => row.role === 'student').length,
    rooms: roomsRes.data?.length ?? 0,
    puzzles: puzzlesRes.data?.length ?? 0,
    activePlayers: activeRes.data?.length ?? 0,
    achievementBadges: (achievementsRes.data ?? []).map((row) => row.name).slice(0, 6),
    activity: activityRes.data ?? [],
  };
}

export async function buildTeacherDashboardSummary() {
  if (!supabaseAdmin) {
    return {
      myStudents: 28,
      studentsPlaying: 6,
      roomsCompleted: 42,
      averageScore: 78,
      totalPlays: 156,
      achievementBadges: ['First Escape', 'First Puzzle Solved', 'Password Master', 'Phishing Detector'],
      recentActivity: [
        {
          id: '1',
          student_name: 'Juan Dela Cruz',
          activity: 'Completed Room 1',
          room: 'Login Security',
          score: 850,
          created_at: new Date().toISOString(),
        },
      ],
      studentPerformance: [
        { id: '1', rank: 1, student: 'Juan Dela Cruz', rooms_completed: 3, current_room: 'Room 4', average_score: 89, attempts: 12, hints_used: 4, play_time: '1h 25m', status: 'Active' },
        { id: '2', rank: 2, student: 'Maria Santos', rooms_completed: 3, current_room: 'Room 4', average_score: 87, attempts: 10, hints_used: 3, play_time: '1h 18m', status: 'Active' },
      ],
    };
  }

  const [studentsRes, sessionsRes, roomProgressRes, scoresRes] = await Promise.all([
    supabaseAdmin.from('students').select('id'),
    supabaseAdmin.from('game_sessions').select('*').eq('status', 'active'),
    supabaseAdmin.from('room_progress').select('*'),
    supabaseAdmin.from('scores').select('*'),
  ]);

  return {
    myStudents: studentsRes.data?.length ?? 0,
    studentsPlaying: sessionsRes.data?.length ?? 0,
    roomsCompleted: roomProgressRes.data?.filter((row) => row.status === 'completed').length ?? 0,
    averageScore:
      scoresRes.data?.length ? Math.round(scoresRes.data.reduce((sum, row) => sum + Number(row.score || 0), 0) / scoresRes.data.length) : 0,
    totalPlays: roomProgressRes.data?.length ?? 0,
    achievementBadges: ['First Escape', 'First Puzzle Solved', 'Password Master', 'Phishing Detector'],
    recentActivity: [],
    studentPerformance: [],
  };
}
