import { Router } from 'express';
import { masterController } from '../controllers/masterController.js';

const router = Router();

// GET /api/masters/search?type=client|item&q=query
router.get('/search', masterController.search);

// POST /api/masters/quick-add
router.post('/quick-add', masterController.quickAdd);

export default router;
