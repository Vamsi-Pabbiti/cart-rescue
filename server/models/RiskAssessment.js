import mongoose from 'mongoose';
import { RISK_LEVELS, ABANDONMENT_REASONS } from '../config/constants.js';

const riskAssessmentSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  score: { type: Number, required: true },
  level: { type: String, enum: Object.values(RISK_LEVELS), required: true },
  signals: [{
    signal: { type: String, required: true },
    impact: { type: Number, required: true }
  }],
  primaryReason: { type: String, enum: Object.values(ABANDONMENT_REASONS), required: true },
  confidence: { type: Number, required: true },
  modelVersion: { type: String, default: 'Risk Engine v1 (Modular Rules + ML Weights)' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('RiskAssessment', riskAssessmentSchema);
