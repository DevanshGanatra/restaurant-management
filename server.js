require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));

// Waiter
app.use('/api/waiter/tables', require('./routes/waiter/tables'));
app.use('/api/waiter/menu', require('./routes/waiter/menu'));
app.use('/api/waiter/orders', require('./routes/waiter/orders'));
app.use('/api/waiter/layout', require('./routes/waiter/layout'));

// Admin
app.use('/api/admin/menu', require('./routes/admin/menu'));
app.use('/api/admin/tables', require('./routes/admin/tables'));
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/analytics', require('./routes/admin/analytics'));
app.use('/api/admin/layout', require('./routes/admin/layout'));

app.get('/', (req, res) => res.send('Restaurant Backend Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
