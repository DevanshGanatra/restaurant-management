require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Item = require('./models/Item');
const Table = require('./models/Table');
const TableLayout = require('./models/TableLayout');

const run = async () => {
  await connectDB();

  // clear minimal
  await User.deleteMany({});
  await Category.deleteMany({});
  await Item.deleteMany({});
  await Table.deleteMany({});
  await TableLayout.deleteMany({});

  const admin = new User({ name: 'Admin', email: 'admin@rest.local', role: 'admin' });
  await admin.setPassword('admin123');
  await admin.save();

  const waiter = new User({ name: 'Waiter', email: 'waiter@rest.local', role: 'waiter' });
  await waiter.setPassword('waiter123');
  await waiter.save();

  // categories
  const c1 = await Category.create({ name: 'PIZZAS', order: 1 });
  const c2 = await Category.create({ name: 'BURGERS', order: 2 });

  // items
  const i1 = await Item.create({ name: 'Margherita', price: 4.9, desc: 'Tomato, cheese', categoryId: c1._id });
  const i2 = await Item.create({ name: 'Pepperoni', price: 6.9, desc: 'Pepperoni', categoryId: c1._id });
  const i3 = await Item.create({ name: 'Classic Burger', price: 3.75, desc: 'Beef patty', categoryId: c2._id });

  // tables
  const t1 = await Table.create({ name: 'T1' });
  const t2 = await Table.create({ name: 'T2' });
  const t3 = await Table.create({ name: 'T3' });

  // simple layout 2x2 with one empty
  await TableLayout.create({
    rows: 2,
    columns: 2,
    layout: [
      { x:0, y:0, type: 'table', tableId: t1._id },
      { x:0, y:1, type: 'table', tableId: t2._id },
      { x:1, y:0, type: 'empty', tableId: null },
      { x:1, y:1, type: 'table', tableId: t3._id }
    ]
  });

  console.log('Seed complete. Admin: admin@rest.local / admin123, Waiter: waiter@rest.local / waiter123');
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
