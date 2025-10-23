import { Router } from 'express';
import { z } from 'zod';
import { Fee } from './model.js';

export const router = Router();

const createSchema = z.object({
  customer: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.number().nonnegative(),
  status: z.enum(['Açık','Ödendi']).optional().default('Açık'),
  note: z.string().optional().default(''),
});
const updateSchema = createSchema.partial();

router.get('/', async (req, res) => {
  const { customer, month, status } = req.query;
  const filter = {};
  if (customer) filter.customer = customer;
  if (month) filter.month = month;
  if (status) filter.status = status;
  const list = await Fee.find(filter).sort({ month: -1, customer: 1 }).lean();
  res.json(list.map(x => ({
    id: x._id, customer: x.customer, month: x.month, amount: x.amount, status: x.status, note: x.note,
  })));
});

router.post('/', async (req, res) => {
  const data = createSchema.parse(req.body);
  const created = await Fee.create(data);
  res.status(201).json({ id: created._id, ...data });
});

router.patch('/:id', async (req, res) => {
  const id = req.params.id;
  const patch = updateSchema.parse(req.body);
  const saved = await Fee.findByIdAndUpdate(id, patch, { new: true });
  if (!saved) return res.status(404).json({ error: 'Not found' });
  res.json({ id: saved._id, customer: saved.customer, month: saved.month, amount: saved.amount, status: saved.status, note: saved.note });
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  await Fee.findByIdAndDelete(id);
  res.status(204).end();
});
