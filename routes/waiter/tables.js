const express = require('express');
const router = express.Router();
const Table = require('../../models/Table');
const auth = require('../../middleware/auth');

// GET /api/waiter/tables
router.get('/', auth, async (req, res) => {
  const tables = await Table.find().sort({ name: 1 });
  res.json({ success:true, data: tables });
});

// POST /api/waiter/tables  (optional: allow waiter to add)
router.post('/', auth, async (req, res) => {
  const table = await Table.create(req.body);
  res.json({ success:true, data: table });
});

// PUT /api/waiter/tables/:id/status
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  if (!['vacant','active'].includes(status)) return res.status(400).json({ success:false, error: 'Invalid status' });
  const table = await Table.findById(req.params.id);
  if (!table) return res.status(404).json({ success:false, error: 'Table not found' });
  table.status = status;
  await table.save();
  res.json({ success:true, data: table });
});

module.exports = router;
