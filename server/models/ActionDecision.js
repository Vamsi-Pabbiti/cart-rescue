import mongoose from 'mongoose';
import { BOUNDED_ACTIONS } from '../config/constants.js';

const actionDecisionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  action: { type: String, enum: Object.values(BOUNDED_ACTIONS), required: true },
  reason: { type: String, required: true },
  estimatedCost: { type: Number, default: 0 },
  expectedBenefit: { type: Number, default: 0 },
  policyStatus: { type: String, enum: ['Approved', 'BLOCKED BY POLICY'], default: 'Approved' },
  policyChecks: {
    budgetCheck: { type: Boolean, default: true },
    marginCheck: { type: Boolean, default: true },
    consentCheck: { type: Boolean, default: true },
    actionAllowed: { type: Boolean, default: true }
  },
  executed: { type: Boolean, default: false },
  executedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ActionDecision', actionDecisionSchema);
