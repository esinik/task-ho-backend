import mongoose from 'mongoose';

const CalendarNoteSchema = new mongoose.Schema({
  customer: { type: String, required: true, index: true },
  title: { type: String, required: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  notes: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export const CalendarNote = mongoose.model('CalendarNote', CalendarNoteSchema);
