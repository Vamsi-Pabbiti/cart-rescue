import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  targetSegment: { type: String, default: 'High Abandonment Risk' },
  budget: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 10 },
  minOrderValue: { type: Number, default: 500 },
  minMarginPercent: { type: Number, default: 8 },
  eligibleActions: [{ type: String }],
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Campaign', campaignSchema);
