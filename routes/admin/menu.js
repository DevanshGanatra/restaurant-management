const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const Item = require('../../models/Item');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// Categories CRUD
router.get('/categories', auth, role(['admin']), async (req, res) => {
  const cats = await Category.find().sort({ order: 1 });
  res.json({ success: true, data: cats });
});

router.post('/categories', auth, role(['admin']), async (req, res) => {
  try {
    const { name, order } = req.body;
    if (!name) return res.status(400).json({ success:false, error: 'Name is required' });
    const cat = await Category.create({ name, order: typeof order === 'number' ? order : 0 });
    res.status(201).json({ success:true, data: cat });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

router.put('/categories/:id', auth, role(['admin']), async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

router.delete('/categories/:id', auth, role(['admin']), async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Items CRUD (supports optional ?categoryId=...)
router.get('/items', auth, role(['admin']), async (req, res) => {
  const { categoryId } = req.query;
  const filter = {};
  if (categoryId) filter.categoryId = categoryId;
  const items = await Item.find(filter).sort({ name: 1 });
  res.json({ success: true, data: items });
});

router.post('/items', auth, role(['admin']), async (req, res) => {
  try {
    const { name, price, categoryId } = req.body;
    if (!name || price == null || !categoryId) {
      return res.status(400).json({ success:false, error: 'name, price and categoryId required' });
    }
    const item = await Item.create(req.body);
    res.status(201).json({ success:true, data: item });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

router.put('/items/:id', auth, role(['admin']), async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: item });
});

router.delete('/items/:id', auth, role(['admin']), async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
