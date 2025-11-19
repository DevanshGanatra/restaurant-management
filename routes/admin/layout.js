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

router.post('/', auth, role(['admin']), async (req, res) => {
  try {
    const { rows, columns, layout } = req.body;

    // 1. Clear all old tables
    await Table.deleteMany({});

    // 2. Recreate tables in order of layout
    let counter = 1;
    const updatedLayout = [];

    for (const cell of layout) {
      if (cell.type === 'table') {

        const newTable = await Table.create({
          name: `T${counter}`,
          status: 'vacant'
        });

        updatedLayout.push({
          ...cell,
          tableId: newTable._id.toString()
        });

        counter++;
      } else {
        updatedLayout.push({ ...cell, tableId: null });
      }
    }

    // 3. Save layout
    let tl = await TableLayout.findOne();
    if (!tl) {
      tl = await TableLayout.create({
        rows,
        columns,
        layout: updatedLayout
      });
    } else {
      tl.rows = rows;
      tl.columns = columns;
      tl.layout = updatedLayout;
      await tl.save();
    }

    return res.json({ success: true, data: tl });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
