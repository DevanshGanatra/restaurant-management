const express = require('express');
const router = express.Router();
const TableLayout = require('../../models/TableLayout');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// GET
router.get('/', auth, role(['admin']), async (req, res) => {
  const layout = await TableLayout.findOne();
  res.json({ success:true, data: layout });
});

// POST or update
router.post('/', auth, role(['admin']), async (req, res) => {
  try {
    const { rows, columns, layout } = req.body;
    let tl = await TableLayout.findOne();
    if (!tl) {
      tl = await TableLayout.create({ rows, columns, layout });
    } else {
      tl.rows = rows;
      tl.columns = columns;
      tl.layout = layout;
      await tl.save();
    }
    res.json({ success:true, data: tl });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

module.exports = router;
