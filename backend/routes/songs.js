const express = require('express');
const router = express.Router();
const Song = require('../models/Song');

// GET all songs
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new song
router.post('/', async (req, res) => {
  const song = new Song({
    title: req.body.title,
    artist: req.body.artist,
    coverImage: req.body.coverImage,
    audioUrl: req.body.audioUrl,
    spotifyUrl: req.body.spotifyUrl,
    tags: req.body.tags
  });

  try {
    const newSong = await song.save();
    res.status(201).json(newSong);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (update) a song
router.put('/', async (req, res) => {
  try {
    const updatedSong = await Song.findByIdAndUpdate(
      req.body.id,
      {
        title: req.body.title,
        artist: req.body.artist,
        coverImage: req.body.coverImage,
        audioUrl: req.body.audioUrl,
        spotifyUrl: req.body.spotifyUrl,
        tags: req.body.tags
      },
      { new: true }
    );
    res.json(updatedSong);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a song
router.delete('/', async (req, res) => {
  const { id } = req.query;
  try {
    await Song.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
