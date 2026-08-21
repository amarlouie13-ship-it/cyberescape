import {
  buildAdminDashboardSummary,
  fetchRoomsWithStatus,
  loadRoomPayload,
  loadStudentProgress,
  submitPuzzleAnswer,
} from '../services/gameService.js';

export async function getGameRooms(req, res, next) {
  try {
    const rooms = await fetchRoomsWithStatus(req.user?.id ?? req.user?.profileId ?? req.user?.id);
    res.json({ rooms });
  } catch (error) {
    next(error);
  }
}

export async function getGameRoom(req, res, next) {
  try {
    const room = await loadRoomPayload(req.params.id);
    res.json({ room });
  } catch (error) {
    next(error);
  }
}

export async function validateGamePuzzle(req, res, next) {
  try {
    const result = await submitPuzzleAnswer({
      studentId: req.user.id,
      roomId: req.body.roomId,
      puzzleId: req.params.id,
      submittedAnswer: req.body.answer,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getStudentDashboard(req, res, next) {
  try {
    res.json({ progress: await loadStudentProgress(req.user.id) });
  } catch (error) {
    next(error);
  }
}

export async function getAdminSummary(_req, res, next) {
  try {
    res.json(await buildAdminDashboardSummary());
  } catch (error) {
    next(error);
  }
}

