import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createUser,
  createPuzzle,
  createRoom,
  deletePuzzle,
  deleteRoom,
  deleteUserProgress,
  listStudents,
  listTeachers,
  listUsers,
  listPuzzles,
  listRooms,
  reorderRooms,
  updatePuzzle,
  updateRoom,
  updateUser,
} from '../controllers/adminController.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/rooms', listRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);
router.put('/rooms/reorder', reorderRooms);

router.get('/users', listUsers);
router.get('/teachers', listTeachers);
router.get('/students', listStudents);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id/progress', deleteUserProgress);

router.get('/puzzles', listPuzzles);
router.post('/puzzles', createPuzzle);
router.put('/puzzles/:id', updatePuzzle);
router.delete('/puzzles/:id', deletePuzzle);

export default router;
