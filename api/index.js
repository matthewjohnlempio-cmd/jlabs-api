const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// ──────────────────────────────────────────────
// CORS – keep your working dynamic setup
// ──────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://jlabs-web-six.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

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
// MongoDB connection with safe defaults (no bufferCommands: false)
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
      // Remove bufferCommands: false → let Mongoose buffer queries during connect
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

module.exports = app;