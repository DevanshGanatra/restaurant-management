const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: String,
  order: Number
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
