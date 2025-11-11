import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  // Historical field used for UI filters previously; kept for backward-compat
  tab: { type: String, enum: ['inbox','today','week','month','later','waiting','done'], default: 'inbox' },
  // New status field to represent task lifecycle
  status: { type: String, enum: ['idle','inprogress','later','waiting','done'], default: 'idle', index: true },
  customer: { type: String, default: '' },
  title: { type: String, required: true },
  type: { type: String, enum: ['Fatura','Rapor','Ödeme'], default: 'Rapor' },
  due: { type: String, required: true }, // YYYY-MM-DD
  priority: { type: String, enum: ['High','Medium','Low'], default: 'Medium' },
  notes: { type: String, default: '' },
}, { timestamps: true });

export const Task = mongoose.model('Task', TaskSchema);
