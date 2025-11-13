const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  name: String,
  status: { type: String, enum: ['vacant','active'], default: 'vacant' }
}, { timestamps: true });

module.exports = mongoose.model('Table', TableSchema);
