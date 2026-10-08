import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { validateBody, registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', getProfile);

export default router;
