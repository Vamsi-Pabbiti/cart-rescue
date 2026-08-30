import Session from '../models/Session.js';
import RiskAssessment from '../models/RiskAssessment.js';
import { calculateRiskScore } from '../services/riskEngine.js';

export const scoreSession = async (req, res, next) => {
  try {
    const riskResult = calculateRiskScore(req.body);
    res.json(riskResult);
  } catch (error) {
    next(error);
  }
};

export const getLiveRiskMonitor = async (req, res, next) => {
  try {
    const highRiskSessions = await Session.find({ riskScore: { $gte: 61 } })
      .sort({ updatedAt: -1 })
      .limit(10);

    const lowCount = await Session.countDocuments({ riskScore: { $lte: 30 } });
    const mediumCount = await Session.countDocuments({ riskScore: { $gt: 30, $lte: 60 } });
    const highCount = await Session.countDocuments({ riskScore: { $gt: 60, $lte: 80 } });
    const criticalCount = await Session.countDocuments({ riskScore: { $gt: 80 } });

    res.json({
      highRiskSessions,
      distribution: {
        low: lowCount,
        medium: mediumCount,
        high: highCount,
        critical: criticalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionRisk = async (req, res, next) => {
  try {
    const assessments = await RiskAssessment.find({ sessionId: req.params.sessionId }).sort({ createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    next(error);
  }
};
