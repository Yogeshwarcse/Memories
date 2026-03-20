const mongoose = require('mongoose');

const favoriteThingSchema = new mongoose.Schema({
  image: { type: String, required: true },
  description: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FavoriteThing', favoriteThingSchema);
