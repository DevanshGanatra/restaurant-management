const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const Item = require('../../models/Item');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const mongoose = require('mongoose');

// Top items in a date range
router.get('/top-items', auth, role(['admin']), async (req,res) => {
  try {
    const { from, to, limit = 10 } = req.query;
    const match = {};
    if (from || to) match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);

    const pipeline = [
      { $match: match },
      { $unwind: '$items' },
      { $group: { _id: '$items.itemId', totalQty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { totalQty: -1 } },
      { $limit: parseInt(limit) },
      { $lookup: { from: 'items', localField: '_id', foreignField: '_id', as: 'item' } },
      { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
      { $project: { itemId: '$_id', name: '$item.name', totalQty:1, revenue:1 } }
    ];
    const resAgg = await Order.aggregate(pipeline);
    res.json({ success:true, data: resAgg });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

// Hourly orders for a single date (date param: YYYY-MM-DD)
router.get('/hourly', auth, role(['admin']), async (req,res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success:false, error: 'date required YYYY-MM-DD' });
    const start = new Date(date + 'T00:00:00.000Z');
    const end = new Date(date + 'T23:59:59.999Z');

    const pipeline = [
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { hour: { $hour: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.hour': 1 } }
    ];
    const resAgg = await Order.aggregate(pipeline);
    res.json({ success:true, data: resAgg });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

module.exports = router;
