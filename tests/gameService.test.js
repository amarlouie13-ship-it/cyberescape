import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinalScore, normalizeText } from '../server/utils/gameMath.js';
import { computeUnlockStatus } from '../server/utils/roomUnlock.js';
import { validatePuzzleAnswer } from '../server/services/gameService.js';

test('normalizeText trims and lowercases', () => {
  assert.equal(normalizeText('  Cyber Escape  '), 'cyber escape');
});

test('calculateFinalScore never goes negative', () => {
  const score = calculateFinalScore({
    baseScore: 100,
    completionTimeSeconds: 5000,
    wrongAttempts: 100,
    hintsUsed: 100,
    difficulty: 'Advanced',
  });

  assert.equal(score, 0);
});

test('computeUnlockStatus unlocks sequential rooms', () => {
  const rooms = [
    { id: 'room-1', room_number: 1 },
    { id: 'room-2', room_number: 2 },
    { id: 'room-3', room_number: 3 },
  ];
  const progress = [{ room_id: 'room-1', status: 'completed' }];
  const result = computeUnlockStatus(rooms, progress);

  assert.equal(result[0].status, 'completed');
  assert.equal(result[1].status, 'available');
  assert.equal(result[2].status, 'locked');
});

test('validatePuzzleAnswer supports exact validation', () => {
  const puzzle = { puzzle_type: 'exact' };
  const rules = [{ rule_type: 'exact_answer', rule_value: 'phishing' }];
  const result = validatePuzzleAnswer(puzzle, 'Phishing', rules, []);

  assert.equal(result.isCorrect, true);
});

test('validatePuzzleAnswer supports password validation', () => {
  const puzzle = { puzzle_type: 'password_rule' };
  const rules = [
    { rule_key: 'min_length', rule_value: '8' },
    { rule_key: 'uppercase', rule_value: 'true' },
    { rule_key: 'lowercase', rule_value: 'true' },
    { rule_key: 'number', rule_value: 'true' },
    { rule_key: 'special', rule_value: 'true' },
  ];
  const result = validatePuzzleAnswer(puzzle, 'Cyber@123', rules, []);

  assert.equal(result.isCorrect, true);
});
