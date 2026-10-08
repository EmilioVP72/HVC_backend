import { Router } from 'express';
import healthRoutes from './health.routes.js';
import workoutRoutes from './workout.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/workouts', workoutRoutes);

export default router;
