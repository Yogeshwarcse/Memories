const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  image: { type: String, required: true },
  description: { type: String, required: true },
  date: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Memory', memorySchema);
