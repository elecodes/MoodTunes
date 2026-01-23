import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply Rate Limiter specifically to registration/login
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

export default router;
