import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  sendSuccess(res, 'Fitness Gold API operativa', {
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
