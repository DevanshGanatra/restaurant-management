const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  desc: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
