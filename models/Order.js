const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  name: String,
  price: Number,
  qty: Number
});

const OrderSchema = new mongoose.Schema({
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  items: [OrderItemSchema],
  status: { type: String, enum: ['draft','completed'], default: 'draft' },
  finishedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
