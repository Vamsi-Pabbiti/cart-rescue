import express from 'express';
import { 
  getOverviewAnalytics, 
  getRecoveryAnalytics, 
  getMarginAnalytics, 
  getExperimentMetrics,
  getFunnelAnalytics 
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/overview', getOverviewAnalytics);
router.get('/recovery', getRecoveryAnalytics);
router.get('/margin', getMarginAnalytics);
router.get('/experiments', getExperimentMetrics);
router.get('/funnel', getFunnelAnalytics);

export default router;
