const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const Table = require('../../models/Table');
const Item = require('../../models/Item');
const auth = require('../../middleware/auth');

// POST /api/waiter/orders  create order (draft)
router.post('/', auth, async (req, res) => {
  try {
    const { tableId, items = [] } = req.body;

    // validate items: fetch item prices and names
    const enriched = [];
    for (const it of items) {
      const dbItem = await Item.findById(it.itemId);
      if (!dbItem) return res.status(400).json({ success:false, error: `Menu item ${it.itemId} not found` });
      enriched.push({
        itemId: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        qty: it.qty || 1
      });
    }

    const order = await Order.create({ tableId, items: enriched, status: 'draft' });
    // mark table active
    if (tableId) {
      const table = await Table.findById(tableId);
      if (table) { table.status = 'active'; await table.save(); }
    }

    res.json({ success:true, data: order });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

// GET /api/waiter/orders/:tableId  get active order for a table (draft)
router.get('/:tableId', auth, async (req, res) => {
  const tableId = req.params.tableId;
  const order = await Order.findOne({ tableId, status: { $ne: 'completed' }}).sort({ createdAt: -1 });
  res.json({ success:true, data: order });
});

// PUT /api/waiter/orders/:orderId  update items (replace items array)
router.put('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success:false, error: 'Order not found' });
    if (order.status === 'completed') return res.status(400).json({ success:false, error: 'Order already completed' });

    const { items = [] } = req.body;
    const enriched = [];
    for (const it of items) {
      const dbItem = await Item.findById(it.itemId);
      if (!dbItem) return res.status(400).json({ success:false, error: `Menu item ${it.itemId} not found` });
      enriched.push({
        itemId: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        qty: it.qty || 1
      });
    }
    order.items = enriched;
    await order.save();
    res.json({ success:true, data: order });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

// POST /api/waiter/orders/:orderId/finish
router.post('/:orderId/finish', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success:false, error: 'Order not found' });
    if (order.status === 'completed') return res.status(400).json({ success:false, error: 'Already completed' });

    order.status = 'completed';
    order.finishedAt = new Date();
    await order.save();

    // mark table vacant
    if (order.tableId) {
      const table = await Table.findById(order.tableId);
      if (table) { table.status = 'vacant'; await table.save(); }
    }

    res.json({ success:true, data: order });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

module.exports = router;
