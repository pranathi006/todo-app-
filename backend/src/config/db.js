const mongoose = require('mongoose');

// Connects to MongoDB. If it fails there's no point keeping the server alive,
// so we log the reason and exit.
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
