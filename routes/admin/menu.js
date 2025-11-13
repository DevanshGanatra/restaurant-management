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

router.post("/categories", auth, role(["admin"]), async (req, res) => {
    try {
        const { name, order } = req.body;

        if (!name || !order) {
            return res.status(400).json({ success: false, error: "Name and order are required" });
        }

        const category = await Category.create({ name, order });

        res.json({ success: true, data: category });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/categories/:id', auth, role(['admin']), async (req, res) => {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: cat });
});
router.delete('/categories/:id', auth, role(['admin']), async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Items CRUD
router.get('/items', auth, role(['admin']), async (req, res) => {
    const items = await Item.find().sort({ name: 1 });
    res.json({ success: true, data: items });
});
router.post('/items', auth, role(['admin']), async (req, res) => {
    const item = await Item.create(req.body);
    res.json({ success: true, data: item });
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
