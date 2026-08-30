import express from 'express';
import { recommendAction, executeAction, getActionHistory } from '../controllers/actionController.js';

const router = express.Router();

router.post('/recommend', recommendAction);
router.post('/execute', executeAction);
router.get('/history', getActionHistory);

export default router;
