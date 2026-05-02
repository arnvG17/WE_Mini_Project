/**
 * WeatherVue Backend — Express.js Server
 * 
 * Entry point for the API server. Configures CORS, JSON parsing,
 * and mounts weather routes. All weather data is fetched from
 * WeatherAPI.com and returned in a cleaned, shaped format.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const weatherRoutes = require('./routes/weather');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount weather routes at root
app.use('/', weatherRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`WeatherVue API running on http://localhost:${PORT}`);
});
