import express from 'express';
import { triggerDemoScenario } from '../controllers/demoController.js';

const router = express.Router();

router.post('/trigger', triggerDemoScenario);

export default router;
