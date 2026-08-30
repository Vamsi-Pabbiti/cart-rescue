import express from 'express';
import { getSessions, getSessionById, createSession, updateSession } from '../controllers/sessionController.js';

const router = express.Router();

router.get('/', getSessions);
router.post('/', createSession);
router.get('/:id', getSessionById);
router.patch('/:id', updateSession);

export default router;
