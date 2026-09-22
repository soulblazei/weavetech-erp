import { Router } from 'express';
import { productionController } from '../controllers/productionController.js';

const router = Router();

// GET /api/production/batches - Fetch live pipeline batches
router.get('/batches', productionController.getBatches);

// POST /api/production/handover - Atomic transactional handover with LAN delta broadcast
router.post('/handover', productionController.handover);

export default router;
