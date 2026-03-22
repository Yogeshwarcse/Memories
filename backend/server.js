require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use('/songs', express.static('public/songs'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ourmemories';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/songs', require('./routes/songs'));
app.use('/api/favorite-days', require('./routes/favorite-days'));
app.use('/api/snaps', require('./routes/snaps'));
app.use('/api/memories', require('./routes/memories'));
app.use('/api/hate', require('./routes/hate'));
app.use('/api/spotify-oembed', require('./routes/spotify-oembed'));

app.get('/', (req, res) => {
  res.send('OurMemories API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
