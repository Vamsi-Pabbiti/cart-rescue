import Session from '../models/Session.js';
import Customer from '../models/Customer.js';
import RiskAssessment from '../models/RiskAssessment.js';
import ActionDecision from '../models/ActionDecision.js';
import AuditLog from '../models/AuditLog.js';
import { assignExperimentGroup } from '../services/experimentEngine.js';

export const getSessions = async (req, res, next) => {
  try {
    const { status, riskLevel, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;
    if (search) {
      query.$or = [
        { sessionId: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }

    const count = await Session.countDocuments(query);
    const sessions = await Session.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      sessions,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalSessions: count
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const customer = await Customer.findOne({ customerId: session.customerId });
    const riskAssessments = await RiskAssessment.find({ sessionId: session.sessionId }).sort({ createdAt: -1 });
    const actionDecisions = await ActionDecision.find({ sessionId: session.sessionId }).sort({ createdAt: -1 });
    const auditLogs = await AuditLog.find({ sessionId: session.sessionId }).sort({ timestamp: -1 });

    res.json({
      session,
      customer,
      latestRiskAssessment: riskAssessments[0] || null,
      latestActionDecision: actionDecisions[0] || null,
      auditLogs
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const { sessionId, customerId, customerName, customerEmail } = req.body;

    const existing = await Session.findOne({ sessionId });
    if (existing) return res.json(existing);

    const experimentGroup = await assignExperimentGroup(sessionId);

    const session = await Session.create({
      sessionId: sessionId || `CR-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: customerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName || 'Guest Customer',
      customerEmail: customerEmail || 'customer@example.com',
      experimentGroup,
      events: [{ eventType: 'session_started', timestamp: new Date() }]
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findOneAndUpdate(
      { sessionId: req.params.id },
      req.body,
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    next(error);
  }
};
