import { Router } from 'express';
import { z } from 'zod';
import { Task } from './model.js';

export const router = Router();

const createSchema = z.object({
  // UI filter hint (optional now)
  tab: z.enum(['inbox','today','week','month','later','waiting','done']).optional().default('inbox'),
  status: z.enum(['idle','inprogress','later','waiting','done']).optional().default('idle'),
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
  const now = new Date();
  const isoToday = now.toISOString().slice(0, 10);

  if (customer) filter.customer = customer;
  if (type) filter.type = type;

  if (overdue === 'true') {
    filter.due = { $lt: isoToday };
    filter.status = { $ne: 'done' };
  }

  // Interpret tab as view filter
  if (tab) {
    switch (tab) {
      case 'inbox':
        // no extra filters (all)
        break;
      case 'today': {
        filter.due = isoToday;
        filter.status = { $ne: 'done' };
        break;
      }
      case 'week': {
        const start = new Date(now);
        const day = start.getDay(); // 0 Sun..6 Sat
        const diffToMonday = (day + 6) % 7; // 0=>6,1=>0,...
        start.setDate(start.getDate() - diffToMonday);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const startStr = start.toISOString().slice(0, 10);
        const endStr = end.toISOString().slice(0, 10);
        filter.due = { $gte: startStr, $lte: endStr };
        filter.status = { $ne: 'done' };
        break;
      }
      case 'month': {
        const year = now.getFullYear();
        const month = now.getMonth(); // 0..11
        const start = new Date(Date.UTC(year, month, 1));
        const end = new Date(Date.UTC(year, month + 1, 0));
        const startStr = start.toISOString().slice(0, 10);
        const endStr = end.toISOString().slice(0, 10);
        filter.due = { $gte: startStr, $lte: endStr };
        filter.status = { $ne: 'done' };
        break;
      }
      case 'later':
        filter.status = 'later';
        break;
      case 'waiting':
        filter.status = 'waiting';
        break;
      case 'done':
        filter.status = 'done';
        break;
      default:
        break;
    }
  }

  const list = await Task.find(filter).sort({ createdAt: -1 }).lean();
  res.json(list.map(x => ({
    id: x._id,
    tab: x.tab,
    status: x.status,
    customer: x.customer,
    title: x.title,
    type: x.type,
    due: x.due,
    priority: x.priority,
    notes: x.notes,
  })));
});

router.post('/', async (req, res) => {
  const data = createSchema.parse(req.body);
  // Backward compatibility: infer status from tab if not explicitly set
  if (!('status' in data) || !data.status) {
    if (['waiting','done','later'].includes(data.tab)) {
      data.status = data.tab;
    } else {
      data.status = 'idle';
    }
  }
  const created = await Task.create(data);
  res.status(201).json({ id: created._id, ...data });
});

router.patch('/:id', async (req, res) => {
  const id = req.params.id;
  const patch = updateSchema.parse(req.body);
  const saved = await Task.findByIdAndUpdate(id, patch, { new: true });
  if (!saved) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: saved._id,
    tab: saved.tab,
    status: saved.status,
    customer: saved.customer,
    title: saved.title,
    type: saved.type,
    due: saved.due,
    priority: saved.priority,
    notes: saved.notes,
  });
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  await Task.findByIdAndDelete(id);
  res.status(204).end();
});
