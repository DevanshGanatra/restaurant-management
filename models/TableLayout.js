const mongoose = require('mongoose');

const TableLayoutSchema = new mongoose.Schema({
  rows: Number,
  columns: Number,
  layout: [
    {
      x: Number,
      y: Number,
      type: { type: String, enum: ['table','empty'], default: 'empty' },
      tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('TableLayout', TableLayoutSchema);
