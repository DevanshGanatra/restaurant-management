const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// list
router.get('/', auth, role(['admin']), async (req,res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json({ success:true, data: users });
});

// create waiter/admin
router.post('/', auth, role(['admin']), async (req,res) => {
  try {
    const { name, email, password, role: userRole } = req.body;
    const u = new User({ name, email, role: userRole || 'waiter' });
    await u.setPassword(password || 'waiter123');
    await u.save();
    res.json({ success:true, data: { id: u._id, name: u.name, email: u.email, role: u.role }});
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

// update
router.put('/:id', auth, role(['admin']), async (req,res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success:false, error: 'User not found' });
  user.name = req.body.name || user.name;
  user.role = req.body.role || user.role;
  await user.save();
  res.json({ success:true, data: { id: user._id, name: user.name, role: user.role }});
});

// delete
router.delete('/:id', auth, role(['admin']), async (req,res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success:true });
});

module.exports = router;
