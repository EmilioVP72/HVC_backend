import { Router } from 'express';
import { getRoutines, getRoutineById, createRoutine } from '../controllers/workout.controller.js';

const router = Router();

router.get('/', getRoutines);
router.get('/:id', getRoutineById);
router.post('/', createRoutine);

export default router;
