import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 50 },
  image: { type: String },
  rating: { type: Number, default: 4.5 },
  shippingCost: { type: Number, default: 99 },
  deliveryDays: { type: Number, default: 3 }
});

export default mongoose.model('Product', productSchema);
