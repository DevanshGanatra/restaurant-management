const express = require('express');
const router = express.Router();
const Table = require('../../models/Table');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.get('/', auth, role(['admin']), async (req,res) => {
  const tables = await Table.find().sort({ name: 1 });
  res.json({ success:true, data: tables });
});

router.post('/', auth, role(['admin']), async (req,res) => {
  const table = await Table.create(req.body);
  res.json({ success:true, data: table });
});

router.put('/:id', auth, role(['admin']), async (req,res) => {
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success:true, data: table });
});

router.delete('/:id', auth, role(['admin']), async (req,res) => {
  await Table.findByIdAndDelete(req.params.id);
  res.json({ success:true });
});

module.exports = router;
