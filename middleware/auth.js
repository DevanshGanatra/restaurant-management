const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ success:false, error: 'No token provided' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload should contain { id, name, role }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success:false, error: 'Invalid token' });
  }
};
