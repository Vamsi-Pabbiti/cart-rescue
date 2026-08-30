import mongoose from 'mongoose';

const experimentSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Default Holdout A/B Experiment' },
  controlPercentage: { type: Number, default: 20 },
  treatmentPercentage: { type: Number, default: 80 },
  status: { type: String, enum: ['active', 'paused'], default: 'active' },
  metrics: {
    controlSessions: { type: Number, default: 0 },
    treatmentSessions: { type: Number, default: 0 },
    controlConversions: { type: Number, default: 0 },
    treatmentConversions: { type: Number, default: 0 },
    controlRevenue: { type: Number, default: 0 },
    treatmentRevenue: { type: Number, default: 0 },
    treatmentDiscountSpend: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Experiment', experimentSchema);
