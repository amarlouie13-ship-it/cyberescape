export function normalizeText(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

export function clampScore(score) {
  return Math.max(0, Math.round(score));
}

export function calculateFinalScore({
  baseScore = 1000,
  completionTimeSeconds = 0,
  wrongAttempts = 0,
  hintsUsed = 0,
  difficulty = 'Beginner',
  bonus = 0,
}) {
  const difficultyBonus = {
    Beginner: 0,
    Intermediate: 120,
    Advanced: 220,
  }[difficulty] ?? 0;

  const timePenalty = Math.floor(completionTimeSeconds / 12) * 5;
  const attemptPenalty = wrongAttempts * 40;
  const hintPenalty = hintsUsed * 30;

  return clampScore(baseScore + difficultyBonus + bonus - timePenalty - attemptPenalty - hintPenalty);
}

