const express = require('express');
const router = express.Router();
const FavoriteDay = require('../models/FavoriteDay');
const upload = require('../middleware/upload');

// GET all
router.get('/', async (req, res) => {
  try {
    const items = await FavoriteDay.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST
router.post('/', upload.single('image'), async (req, res) => {
  let imageUrl = '';
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  let tags = req.body.tags;
  if (typeof tags === 'string') {
    try { tags = JSON.parse(tags); } catch { tags = tags.split(',').map(tag => tag.trim()); }
  }

  const item = new FavoriteDay({
    date: req.body.date,
    image: imageUrl,
    description: req.body.description,
    tags: tags
  });
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/', async (req, res) => {
  const id = req.query.id?.split(':')[0];
  try {
    await FavoriteDay.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT (Update)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id.split(':')[0];
    
    const updateData = { ...req.body };
    if (typeof updateData.tags === 'string') {
      try { updateData.tags = JSON.parse(updateData.tags); } 
      catch { updateData.tags = updateData.tags.split(',').map(tag => tag.trim()); }
    }
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else {
      delete updateData.image;
    }

    const updatedItem = await FavoriteDay.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Day not found' });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
