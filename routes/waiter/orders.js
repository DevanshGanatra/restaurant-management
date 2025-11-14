// routes/waiter/orders.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../../models/Order');
const Table = require('../../models/Table');
const Item = require('../../models/Item');
const auth = require('../../middleware/auth');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/waiter/orders  create order (draft)
router.post('/', auth, async (req, res) => {
  try {
    const { tableId, items = [] } = req.body;

    if (!tableId || !isValidId(tableId)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing tableId' });
    }

    // verify table exists
    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ success: false, error: 'Table not found' });

    // validate & enrich items
    const enriched = [];
    for (const it of items) {
      if (!it.itemId || !isValidId(it.itemId)) {
        return res.status(400).json({ success: false, error: 'Invalid itemId in items' });
      }
      const dbItem = await Item.findById(it.itemId);
      if (!dbItem) return res.status(400).json({ success: false, error: `Menu item ${it.itemId} not found` });
      enriched.push({
        itemId: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        qty: it.qty || 1
      });
    }

    // create order as draft
    const order = await Order.create({ tableId, items: enriched, status: 'draft' });

    // mark table active (you may want to change this behaviour: mark active only when order is sent)
    table.status = 'active';
    await table.save();

    const populated = await Order.findById(order._id).populate('tableId');
    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('POST /orders error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/waiter/orders  list orders (supports ?status=draft|completed)
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const orders = await Order.find(filter).populate('tableId').sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error('GET /orders error', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/waiter/orders/:tableId  get latest non-completed order for a table
router.get('/:tableId', auth, async (req, res) => {
  try {
    const tableId = req.params.tableId;
    if (!isValidId(tableId)) return res.status(400).json({ success: false, error: 'Invalid tableId' });

    const order = await Order.findOne({ tableId, status: { $ne: 'completed' } })
      .sort({ createdAt: -1 })
      .populate('tableId');

    return res.json({ success: true, data: order ?? null });
  } catch (err) {
    console.error('GET /orders/:tableId error', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/waiter/orders/:orderId  update items (replace items array)
router.put('/:orderId', auth, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    if (!isValidId(orderId)) return res.status(400).json({ success: false, error: 'Invalid orderId' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.status === 'completed') return res.status(400).json({ success: false, error: 'Order already completed' });

    const { items = [] } = req.body;
    const enriched = [];
    for (const it of items) {
      if (!it.itemId || !isValidId(it.itemId)) {
        return res.status(400).json({ success: false, error: `Invalid itemId in items` });
      }
      const dbItem = await Item.findById(it.itemId);
      if (!dbItem) return res.status(400).json({ success: false, error: `Menu item ${it.itemId} not found` });
      enriched.push({
        itemId: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        qty: it.qty || 1
      });
    }
    order.items = enriched;
    await order.save();

    const populated = await Order.findById(order._id).populate('tableId');
    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error('PUT /orders/:orderId error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/waiter/orders/:orderId/finish
router.post('/:orderId/finish', auth, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    if (!isValidId(orderId)) return res.status(400).json({ success: false, error: 'Invalid orderId' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.status === 'completed') return res.status(400).json({ success: false, error: 'Already completed' });

    order.status = 'completed';
    order.finishedAt = new Date();
    await order.save();

    // mark table vacant
    if (order.tableId) {
      await Table.findByIdAndUpdate(order.tableId, { status: 'vacant' });
    }

    const populated = await Order.findById(order._id).populate('tableId');
    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error('POST /orders/:orderId/finish error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
