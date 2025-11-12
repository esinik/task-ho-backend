import { Router } from 'express';
import { z } from 'zod';
import { Customer } from './model.js';

export const router = Router();

router.get('/', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
  const list = await Customer.find(filter).sort({ name: 1 }).lean();
  res.json(list.map(x => ({ 
    id: x._id, 
    name: x.name,
    isPaid: x.isPaid ?? false,
    fee: x.fee ?? 0,
  })));
});

router.post('/', async (req, res) => {
  const bodySchema = z.object({ 
    name: z.string().min(1).max(120),
    isPaid: z.boolean().optional().default(false),
    fee: z.number().nonnegative().optional().default(0),
  });
  const data = bodySchema.parse(req.body);
  const exists = await Customer.findOne({ name: data.name });
  if (exists) {
    // Update existing customer
    exists.isPaid = data.isPaid;
    exists.fee = data.fee;
    await exists.save();
    return res.json({ 
      id: exists._id, 
      name: exists.name,
      isPaid: exists.isPaid,
      fee: exists.fee,
    });
  }
  const created = await Customer.create({ 
    name: data.name,
    isPaid: data.isPaid,
    fee: data.fee,
  });
  res.status(201).json({ 
    id: created._id, 
    name: created.name,
    isPaid: created.isPaid,
    fee: created.fee,
  });
});
