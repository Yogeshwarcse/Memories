const express = require('express');
const router = express.Router();
const Snap = require('../models/Snap');
const upload = require('../middleware/upload');

// GET all
router.get('/', async (req, res) => {
  try {
    const items = await Snap.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST
router.post('/', upload.single('image'), async (req, res) => {
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  let tags = req.body.tags;
  if (typeof tags === 'string') {
    try { tags = JSON.parse(tags); } catch { tags = tags.split(',').map(tag => tag.trim()); }
  }

  const item = new Snap({
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
    await Snap.findByIdAndDelete(id);
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
    }

    const updatedItem = await Snap.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Snap not found' });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
