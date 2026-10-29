require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Quick health check - handy for testing the emulator can reach the server
app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Anything that slipped through
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // 0.0.0.0 so the Android emulator (10.0.2.2) and real devices on Wi-Fi can reach it
  app.listen(PORT, '0.0.0.0', () => console.log(`API running on port ${PORT}`));
});
