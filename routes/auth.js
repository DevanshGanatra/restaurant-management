const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register (for testing / seeding)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, error: 'Missing email/password' });
    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success:false, error: 'User exists' });
    const user = new User({ name, email, role });
    await user.setPassword(password);
    await user.save();
    return res.json({ success:true, data: { id: user._id, name: user.name, email: user.email, role: user.role }});
  } catch (err) {
    return res.status(500).json({ success:false, error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success:false, error: 'User not found' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ success:false, error: 'Invalid credentials' });
    const payload = { id: user._id, name: user.name, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success:true, data: { token, user: payload }});
  } catch (err) {
    return res.status(500).json({ success:false, error: err.message });
  }
});

module.exports = router;
