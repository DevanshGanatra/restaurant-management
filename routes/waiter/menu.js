const express = require('express');
const router = express.Router();
const Item = require('../../models/Item');
const Category = require('../../models/Category');
const auth = require('../../middleware/auth');

// GET categories
router.get('/categories', auth, async (req, res) => {
  const cats = await Category.find().sort({ order: 1 });
  res.json({ success:true, data: cats });
});

// GET items (with optional search)
router.get('/items', auth, async (req, res) => {
  const { search, categoryId, available } = req.query;
  const q = {};
  if (search) q.name = { $regex: search, $options: 'i' };
  if (categoryId) q.categoryId = categoryId;
  if (available !== undefined) q.available = available === 'true';
  const items = await Item.find(q).sort({ name: 1 });
  res.json({ success:true, data: items });
});

module.exports = router;
