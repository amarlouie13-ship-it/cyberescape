import { buildAdminDashboardSummary, buildTeacherDashboardSummary, loadStudentProgress } from '../services/gameService.js';

export async function adminDashboard(_req, res, next) {
  try {
    res.json(await buildAdminDashboardSummary());
  } catch (error) {
    next(error);
  }
}

export async function teacherDashboard(req, res, next) {
  try {
    res.json(await buildTeacherDashboardSummary(req.user.id));
  } catch (error) {
    next(error);
  }
}

export async function studentDashboard(req, res, next) {
  try {
    const progress = await loadStudentProgress(req.user.id);
    res.json({ progress });
  } catch (error) {
    next(error);
  }
}
