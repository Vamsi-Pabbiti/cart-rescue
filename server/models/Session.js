import mongoose from 'mongoose';
import { BOUNDED_ACTIONS, ABANDONMENT_REASONS, RISK_LEVELS, EXPERIMENT_GROUPS } from '../config/constants.js';

const eventSchema = new mongoose.Schema({
  eventType: { 
    type: String, 
    required: true,
    enum: [
      'session_started',
      'product_viewed',
      'product_added',
      'cart_updated',
      'checkout_started',
      'payment_attempted',
      'payment_failed',
      'payment_success',
      'exit_intent',
      'shipping_calculated',
      'cod_attempted'
    ] 
  },
  details: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, required: true, index: true },
  customerName: { type: String, default: 'Guest Customer' },
  customerEmail: { type: String },
  cartItems: [cartItemSchema],
  cartValue: { type: Number, default: 0 },
  cartValueChange: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  deliveryDays: { type: Number, default: 3 },
  codAvailable: { type: Boolean, default: true },
  events: [eventSchema],
  currentPage: { type: String, default: '/home' },
  productViews: { type: Number, default: 0 },
  pageTransitions: { type: Number, default: 0 },
  timeOnPage: { type: Number, default: 0 },
  paymentAttempts: { type: Number, default: 0 },
  paymentFailures: { type: Number, default: 0 },
  checkoutStarted: { type: Boolean, default: false },
  exitIntent: { type: Boolean, default: false },
  purchaseCompleted: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['active', 'abandoned', 'recovered', 'converted'], 
    default: 'active',
    index: true 
  },
  riskScore: { type: Number, default: 0, index: true },
  riskLevel: { 
    type: String, 
    enum: Object.values(RISK_LEVELS), 
    default: RISK_LEVELS.LOW 
  },
  abandonmentReason: { 
    type: String, 
    enum: Object.values(ABANDONMENT_REASONS), 
    default: ABANDONMENT_REASONS.UNKNOWN 
  },
  recommendedAction: { 
    type: String, 
    enum: Object.values(BOUNDED_ACTIONS), 
    default: BOUNDED_ACTIONS.DO_NOTHING 
  },
  actionExecuted: { type: Boolean, default: false },
  actionExecutedAt: { type: Date },
  experimentGroup: { 
    type: String, 
    enum: Object.values(EXPERIMENT_GROUPS), 
    default: EXPERIMENT_GROUPS.TREATMENT 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now, index: true }
});

sessionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Session', sessionSchema);
