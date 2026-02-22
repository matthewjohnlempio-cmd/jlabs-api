const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// ──────────────────────────────────────────────
// CORS – reliable manual version (works on local + Vercel)
const allowedOrigins = [
  'http://localhost:5173',           // Vite local dev
  'http://localhost:3000',           // fallback for other local ports
  'https://jlabs-web-six.vercel.app' // your deployed frontend
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow exact matches or fallback to * for local testing
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Safe fallback – Vercel requests usually have origin, but this prevents blocks
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Explicitly handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

// ──────────────────────────────────────────────
// Wait for DB connection globally (prevents "connection not complete" error)
// ──────────────────────────────────────────────
let dbReady = false;

const waitForDb = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    dbReady = true;
    return next();
  }

  try {
    console.log('Waiting for DB connection before route...');
    await mongoose.connection.asPromise(); // Wait until ready
    dbReady = true;
    next();
  } catch (err) {
    console.error('DB wait failed:', err.message);
    res.status(503).json({ message: 'Database not ready yet, try again soon' });
  }
};

// Apply wait only to routes that use DB
app.use('/login', waitForDb); // Add for other DB routes later

// ──────────────────────────────────────────────
// MongoDB connection with safe defaults
// ──────────────────────────────────────────────
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 10000,
      maxPoolSize: 5,
      family: 4,
      // No bufferCommands: false – allow default buffering
    });
    console.log('MongoDB Connected successfully →', mongoose.connection.host);
  } catch (err) {
    console.error('MongoDB connection FAILED:', err.message);
    // Retry after 3s
    setTimeout(connectDB, 3000);
  }
};

// Start connection
connectDB();

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use(authRoutes);

// Health check
app.get('/', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.json({
    message: 'JLABS API is running',
    environment: process.env.NODE_ENV || 'production',
    mongoStatus: states[readyState] || 'unknown',
    readyState,
    hasMongoUri: !!process.env.MONGO_URI,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message);
  res.status(500).json({ message: 'Server error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ──────────────────────────────────────────────
// Start the server (only needed for local dev)
// On Vercel, this is not used — Vercel calls the exported app directly
// ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log(`Test it: open http://localhost:${PORT}/ in your browser`);
  });
}

module.exports = app;