import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  datasetSource: { type: String, default: 'Kaggle E-Commerce Clickstream Benchmark' },
  totalRows: { type: Number, default: 0 },
  importedSessions: { type: Number, default: 0 },
  importedEvents: { type: Number, default: 0 },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'completed' },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Dataset', datasetSchema);
