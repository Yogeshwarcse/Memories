const express = require('express');
const router = express.Router();
const Snap = require('../models/Snap');

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
router.post('/', async (req, res) => {
  const item = new Snap({
    image: req.body.image,
    description: req.body.description,
    tags: req.body.tags
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
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id.split(':')[0];
    const updatedItem = await Snap.findByIdAndUpdate(
      id,
      { $set: req.body },
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
