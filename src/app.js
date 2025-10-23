import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'express-async-errors';
import mongoose from 'mongoose';
import { router as apiRouter } from './routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskho';
await mongoose.connect(uri);

app.get('/', (_req, res) => res.json({ name: 'TaskHo API', status: 'ok' }));
app.use('/api', apiRouter);

// error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Unknown error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`TaskHo API listening on http://localhost:${port}`));
