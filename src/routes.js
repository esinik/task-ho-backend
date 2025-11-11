import { Router } from 'express';
import { router as taskRouter } from './modules/tasks/routes.js';
import { router as feeRouter } from './modules/fees/routes.js';
import { router as customerRouter } from './modules/customers/routes.js';
import { router as authRouter } from './modules/auth/routes.js';
import { authMiddleware } from './modules/auth/middleware.js';

export const router = Router();

// Public routes
router.use('/auth', authRouter);

// Protected routes - require authentication
router.use('/tasks', authMiddleware, taskRouter);
router.use('/fees', authMiddleware, feeRouter);
router.use('/customers', authMiddleware, customerRouter);
