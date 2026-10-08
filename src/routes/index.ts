import { Router } from 'express';
import healthRoutes from './health.routes.js';
import workoutRoutes from './workout.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/workouts', workoutRoutes);
router.use('/auth', authRoutes);

export default router;
