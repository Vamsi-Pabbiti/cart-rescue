import express from 'express';
import { scoreSession, getLiveRiskMonitor, getSessionRisk } from '../controllers/riskController.js';

const router = express.Router();

router.post('/score', scoreSession);
router.get('/live', getLiveRiskMonitor);
router.get('/:sessionId', getSessionRisk);

export default router;
