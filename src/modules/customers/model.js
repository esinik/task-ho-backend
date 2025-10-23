import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
}, { timestamps: true });

export const Customer = mongoose.model('Customer', CustomerSchema);
