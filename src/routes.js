import { Router } from 'express';
import { router as taskRouter } from './modules/tasks/routes.js';
import { router as feeRouter } from './modules/fees/routes.js';
import { router as customerRouter } from './modules/customers/routes.js';

export const router = Router();

router.use('/tasks', taskRouter);
router.use('/fees', feeRouter);
router.use('/customers', customerRouter);
