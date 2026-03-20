const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Spotify oEmbed fetch failed');
    
    const data = await response.json();
    
    // Extract artist and title from oEmbed title "Song Title by Artist Name"
    const titleParts = data.title.split(' by ');
    const title = titleParts[0];
    const artist = titleParts[1] || 'Unknown Artist';

    res.json({
      title,
      artist,
      coverImage: data.thumbnail_url,
      provider: data.provider_name
    });
  } catch (err) {
    console.error('Spotify oEmbed Error:', err);
    res.status(500).json({ error: 'Failed to fetch Spotify metadata' });
  }
});

module.exports = router;
