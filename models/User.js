const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin','waiter'], default: 'waiter' }
}, { timestamps: true });

UserSchema.methods.setPassword = async function(password) {
  this.password = await bcrypt.hash(password, 10);
};

UserSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
