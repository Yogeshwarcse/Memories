const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Song = require('./models/Song');

const SONGS_DIR = path.join(__dirname, 'public', 'songs');

async function seedSongs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const files = fs.readdirSync(SONGS_DIR);
    console.log(`Found ${files.length} files in ${SONGS_DIR}`);

    for (const file of files) {
      if (!file.endsWith('.mpeg') && !file.endsWith('.mp3')) continue;

      const title = file.replace(/\.(mpeg|mp3)$/, '').split(' - ')[0] || file;
      const artist = file.split(' - ')[1]?.replace(/\.(mpeg|mp3)$/, '') || 'Unknown Artist';
      const audioUrl = `/songs/${encodeURIComponent(file)}`;
      
      // Check if already exists
      const existing = await Song.findOne({ audioUrl });
      if (!existing) {
        await Song.create({
          title,
          artist,
          audioUrl,
          coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60', // placeholder
          tags: ['Memory']
        });
        console.log(`Added: ${title}`);
      } else {
        console.log(`Skipped (exists): ${title}`);
      }
    }

    console.log('Seeding complete');
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding songs:', err);
    process.exit(1);
  }
}

seedSongs();
