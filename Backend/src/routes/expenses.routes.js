import { Router } from 'express';
import { minimise } from '../controllers/expenses.controller.js';

const router = Router();

router.get('/minimise', minimise);

export default router;