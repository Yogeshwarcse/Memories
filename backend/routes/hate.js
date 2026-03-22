const express = require('express');
const router = express.Router();
const HateCounter = require('../models/HateCounter');

// GET total hits
router.get('/', async (req, res) => {
  try {
    let counter = await HateCounter.findOne();
    if (!counter) {
      counter = new HateCounter({ count: 0 });
      await counter.save();
    }
    res.json(counter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Increment hits
router.post('/hit', async (req, res) => {
  try {
    let counter = await HateCounter.findOne();
    if (!counter) {
      counter = new HateCounter({ count: 1 });
    } else {
      counter.count += 1;
      counter.lastUpdated = Date.now();
    }
    await counter.save();
    res.json(counter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Reset hits
router.post('/reset', async (req, res) => {
  try {
    let counter = await HateCounter.findOne();
    if (counter) {
      counter.count = 0;
      counter.lastUpdated = Date.now();
      await counter.save();
    }
    res.json(counter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
