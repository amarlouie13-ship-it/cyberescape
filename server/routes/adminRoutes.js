import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createPuzzle,
  createRoom,
  deletePuzzle,
  deleteRoom,
  listPuzzles,
  listRooms,
  updatePuzzle,
  updateRoom,
} from '../controllers/adminController.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/rooms', listRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

router.get('/puzzles', listPuzzles);
router.post('/puzzles', createPuzzle);
router.put('/puzzles/:id', updatePuzzle);
router.delete('/puzzles/:id', deletePuzzle);

export default router;
