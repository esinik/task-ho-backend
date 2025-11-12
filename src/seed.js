import mongoose from 'mongoose';
import 'dotenv/config';
import { Task } from './modules/tasks/model.js';
import { Fee } from './modules/fees/model.js';
import { Customer } from './modules/customers/model.js';
import { User } from './modules/auth/model.js';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskho';

const start = async () => {
  await mongoose.connect(uri);

  await Customer.deleteMany({});
  await Task.deleteMany({});
  await Fee.deleteMany({});
  await User.deleteMany({});

  // Create a test user
  const testUser = new User({
    email: 'test@taskho.com',
    password: 'test123',
    name: 'Test User'
  });
  await testUser.save();
  console.log('Test user created: test@taskho.com / test123');

  const customers = ['ACME LLC','Blue Motors','Kudo Accounting','Sezer Co.'];
  await Customer.insertMany([
    { name: 'ACME LLC', isPaid: true, fee: 500 },
    { name: 'Blue Motors', isPaid: true, fee: 700 },
    { name: 'Kudo Accounting', isPaid: true, fee: 650 },
    { name: 'Sezer Co.', isPaid: false, fee: 0 },
  ]);

  await Task.insertMany([
    { tab: 'inbox', status: 'idle', customer: 'ACME LLC', title: 'Yeni müşteri kaydı', type: 'Rapor', due: '2025-10-24', priority: 'High' },
    { tab: 'today', status: 'inprogress', customer: 'Blue Motors', title: 'Fatura kontrolü', type: 'Fatura', due: '2025-10-22', priority: 'Medium' },
    { tab: 'week', status: 'waiting', customer: 'Kudo Accounting', title: 'Ödeme takibi', type: 'Ödeme', due: '2025-10-26', priority: 'High', notes: 'Müşteri arandı' },
    { tab: 'done', status: 'done', customer: 'Sezer Co.', title: 'Kasa raporu', type: 'Rapor', due: '2025-10-21', priority: 'Low', notes: 'Teslim edildi' },
  ]);

  await Fee.insertMany([
    { customer: 'ACME LLC', month: '2025-10', amount: 500, status: 'Açık', note: 'Yeni tarife' },
    { customer: 'Blue Motors', month: '2025-10', amount: 700, status: 'Ödendi', note: 'Havale ile' },
    { customer: 'Kudo Accounting', month: '2025-10', amount: 650, status: 'Açık' },
  ]);

  console.log('Seed completed.');
  await mongoose.disconnect();
};

start().catch(e => { console.error(e); process.exit(1); });
