import mongoose from 'mongoose';
import { RISK_LEVELS, ABANDONMENT_REASONS, BOUNDED_ACTIONS } from '../config/constants.js';

const auditLogSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  riskScore: { type: Number, required: true },
  riskLevel: { type: String, enum: Object.values(RISK_LEVELS), required: true },
  signals: [{
    signal: { type: String },
    impact: { type: Number }
  }],
  diagnosis: {
    primaryReason: { type: String, enum: Object.values(ABANDONMENT_REASONS) },
    confidence: { type: Number },
    explanation: { type: String }
  },
  action: {
    recommendedAction: { type: String, enum: Object.values(BOUNDED_ACTIONS) },
    reason: { type: String },
    estimatedCost: { type: Number },
    expectedBenefit: { type: Number }
  },
  policyChecks: {
    budgetCheck: { type: Boolean },
    marginCheck: { type: Boolean },
    consentCheck: { type: Boolean },
    actionAllowed: { type: Boolean },
    status: { type: String }
  },
  result: { type: String, required: true },
  actionExecuted: { type: Boolean, default: false },
  modelVersion: { type: String, default: 'Risk Engine v1 (Modular Rules + ML Weights)' },
  timestamp: { type: Date, default: Date.now, index: true }
});

export default mongoose.model('AuditLog', auditLogSchema);
