import { Router } from 'express';
import { getGameRoom, getGameRooms, validateGamePuzzle } from '../controllers/gameController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/rooms', requireAuth, getGameRooms);
router.get('/rooms/:id', requireAuth, getGameRoom);
router.post('/puzzles/:id/validate', requireAuth, requireRole('student'), validateGamePuzzle);

export default router;

