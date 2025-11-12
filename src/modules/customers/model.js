import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  isPaid: { type: Boolean, default: false },
  fee: { type: Number, default: 0 },
}, { timestamps: true });

export const Customer = mongoose.model('Customer', CustomerSchema);
