import { Router } from 'express';
import { z } from 'zod';
import { CalendarNote } from './model.js';

export const router = Router();

const createSchema = z.object({
  customer: z.string().min(1),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional().default(''),
  isCompleted: z.boolean().optional().default(false),
});

const updateSchema = createSchema.partial();

// Get all notes (with optional date range filter)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, customer } = req.query;
    const filter = {};

    if (customer) {
      filter.customer = customer;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const notes = await CalendarNote.find(filter).sort({ date: 1, createdAt: 1 });
    res.json(notes);
  } catch (err) {
    console.error('Error fetching calendar notes:', err);
    res.status(500).json({ error: 'Takvim notları getirilemedi' });
  }
});

// Get weekly notes grouped by customer and date
router.get('/weekly', async (req, res) => {
  try {
    const { startDate } = req.query;
    let monday;

    if (startDate) {
      monday = new Date(startDate);
    } else {
      const now = new Date();
      const day = now.getDay(); // 0=Sun, 1=Mon, ...
      const diffToMonday = (day + 6) % 7;
      monday = new Date(now);
      monday.setDate(monday.getDate() - diffToMonday);
    }

    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);

    const startStr = monday.toISOString().slice(0, 10);
    const endStr = sunday.toISOString().slice(0, 10);

    const notes = await CalendarNote.find({
      date: { $gte: startStr, $lte: endStr }
    }).sort({ date: 1, createdAt: 1 });

    // Group by customer then by date
    const grouped = {};
    for (const note of notes) {
      if (!grouped[note.customer]) grouped[note.customer] = {};
      if (!grouped[note.customer][note.date]) grouped[note.customer][note.date] = [];
      grouped[note.customer][note.date].push({
        id: note._id,
        title: note.title,
        notes: note.notes,
        isCompleted: note.isCompleted,
      });
    }

    res.json({
      startDate: startStr,
      endDate: endStr,
      notes: grouped,
    });
  } catch (err) {
    console.error('Error fetching weekly calendar notes:', err);
    res.status(500).json({ error: 'Haftalık takvim notları getirilemedi' });
  }
});

// Get note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await CalendarNote.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Not bulunamadı' });
    res.json(note);
  } catch (err) {
    console.error('Error fetching calendar note:', err);
    res.status(500).json({ error: 'Takvim notu getirilemedi' });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const body = createSchema.parse(req.body);
    const note = await CalendarNote.create(body);
    res.status(201).json(note);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Doğrulama hatası', details: err.errors });
    }
    console.error('Error creating calendar note:', err);
    res.status(500).json({ error: 'Takvim notu oluşturulamadı' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const body = updateSchema.parse(req.body);
    const note = await CalendarNote.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ error: 'Not bulunamadı' });
    res.json(note);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Doğrulama hatası', details: err.errors });
    }
    console.error('Error updating calendar note:', err);
    res.status(500).json({ error: 'Takvim notu güncellenemedi' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const note = await CalendarNote.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: 'Not bulunamadı' });
    res.json({ message: 'Not başarıyla silindi' });
  } catch (err) {
    console.error('Error deleting calendar note:', err);
    res.status(500).json({ error: 'Takvim notu silinemedi' });
  }
});
