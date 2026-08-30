import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { sessionId, riskLevel, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (sessionId) query.sessionId = sessionId;
    if (riskLevel) query.riskLevel = riskLevel;
    if (search) {
      query.$or = [
        { sessionId: { $regex: search, $options: 'i' } },
        { result: { $regex: search, $options: 'i' } }
      ];
    }

    const count = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalLogs: count
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogById = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Audit log entry not found' });
    res.json(log);
  } catch (error) {
    next(error);
  }
};
