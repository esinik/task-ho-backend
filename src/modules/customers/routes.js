import { Router } from 'express';
import { z } from 'zod';
import { Customer } from './model.js';

export const router = Router();

router.get('/', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
  const list = await Customer.find(filter).sort({ name: 1 }).lean();
  res.json(list.map(x => ({ id: x._id, name: x.name })));
});

router.post('/', async (req, res) => {
  const bodySchema = z.object({ name: z.string().min(1).max(120) });
  const data = bodySchema.parse(req.body);
  const exists = await Customer.findOne({ name: data.name });
  if (exists) return res.json({ id: exists._id, name: exists.name });
  const created = await Customer.create({ name: data.name });
  res.status(201).json({ id: created._id, name: created.name });
});
