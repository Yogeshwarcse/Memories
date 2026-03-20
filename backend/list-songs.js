const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Song = require('./models/Song');

async function listSongs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const songs = await Song.find({});
    console.log(JSON.stringify(songs, null, 2));
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listSongs();
