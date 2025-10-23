import mongoose from 'mongoose';

const FeeSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  month: { type: String, required: true }, // YYYY-MM
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Açık','Ödendi'], default: 'Açık' },
  note: { type: String, default: '' },
}, { timestamps: true });

FeeSchema.index({ customer: 1, month: 1 }, { unique: true });

export const Fee = mongoose.model('Fee', FeeSchema);
