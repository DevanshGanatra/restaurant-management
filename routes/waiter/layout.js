const express = require('express');
const router = express.Router();
const TableLayout = require('../../models/TableLayout');
const auth = require('../../middleware/auth');

// GET /api/waiter/layout
router.get('/', auth, async (req, res) => {
  const layout = await TableLayout.findOne().populate('layout.tableId');
  res.json({ success:true, data: layout });
});

module.exports = router;
