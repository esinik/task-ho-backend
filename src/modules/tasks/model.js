import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  tab: { type: String, enum: ['inbox','today','week','later','waiting','done'], required: true },
  customer: { type: String, default: '' },
  title: { type: String, required: true },
  type: { type: String, enum: ['Fatura','Rapor','Ödeme'], default: 'Rapor' },
  due: { type: String, required: true }, // YYYY-MM-DD
  priority: { type: String, enum: ['High','Medium','Low'], default: 'Medium' },
  notes: { type: String, default: '' },
}, { timestamps: true });

export const Task = mongoose.model('Task', TaskSchema);
