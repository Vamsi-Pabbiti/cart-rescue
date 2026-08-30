import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  emailOptIn: { type: Boolean, default: true },
  smsOptIn: { type: Boolean, default: false },
  whatsappOptIn: { type: Boolean, default: true },
  pushOptIn: { type: Boolean, default: true },
  totalOrders: { type: Number, default: 0 },
  totalSpend: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Customer', customerSchema);
