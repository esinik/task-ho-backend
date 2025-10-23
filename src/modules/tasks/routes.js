import { Router } from 'express';
import { z } from 'zod';
import { Task } from './model.js';

export const router = Router();

const createSchema = z.object({
  tab: z.enum(['inbox','today','week','later','waiting','done']),
  customer: z.string().optional().default(''),
  title: z.string().min(1),
  type: z.enum(['Fatura','Rapor','Ödeme']).optional().default('Rapor'),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priority: z.enum(['High','Medium','Low']).optional().default('Medium'),
  notes: z.string().optional().default(''),
});

const updateSchema = createSchema.partial();

router.get('/', async (req, res) => {
  const { tab, customer, type, overdue } = req.query;
  const filter = {};
  if (tab) filter.tab = tab;
  if (customer) filter.customer = customer;
  if (type) filter.type = type;
  if (overdue === 'true') {
    const today = new Date().toISOString().slice(0,10);
    filter.due = { $lt: today };
    filter.tab = { $ne: 'done' };
  }
  const list = await Task.find(filter).sort({ createdAt: -1 }).lean();
  res.json(list.map(x => ({
    id: x._id, tab: x.tab, customer: x.customer, title: x.title, type: x.type,
    due: x.due, priority: x.priority, notes: x.notes,
  })));
});

router.post('/', async (req, res) => {
  const data = createSchema.parse(req.body);
  const created = await Task.create(data);
  res.status(201).json({ id: created._id, ...data });
});

router.patch('/:id', async (req, res) => {
  const id = req.params.id;
  const patch = updateSchema.parse(req.body);
  const saved = await Task.findByIdAndUpdate(id, patch, { new: true });
  if (!saved) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: saved._id, tab: saved.tab, customer: saved.customer, title: saved.title,
    type: saved.type, due: saved.due, priority: saved.priority, notes: saved.notes,
  });
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  await Task.findByIdAndDelete(id);
  res.status(204).end();
});
