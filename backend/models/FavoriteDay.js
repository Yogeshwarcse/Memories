const mongoose = require('mongoose');

const favoriteDaySchema = new mongoose.Schema({
  date: { type: String, required: true },
  image: { type: String, required: true },
  description: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FavoriteDay', favoriteDaySchema);
