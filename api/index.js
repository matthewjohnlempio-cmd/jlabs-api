const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// ──────────────────────────────────────────────
// CORS – dynamic and safe for your frontend
// ──────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',           // Vite default
  'http://localhost:3000',
  'https://jlabs-web-six.vercel.app',
  // Add preview branches if needed: 'https://jlabs-web-six-*.vercel.app'
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
// Cached + retry MongoDB connection (critical for Vercel serverless)
// ──────────────────────────────────────────────
let cachedConnection = null;

const connectDB = async () => {
  // Reuse existing connection if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,    // Fail faster → better logs
      socketTimeoutMS: 45000,
      maxPoolSize: 10,                   // Reasonable limit for serverless
      family: 4,                         // Prefer IPv4 (fixes some DNS issues)
      connectTimeoutMS: 10000,
    });

    cachedConnection = conn;
    console.log('MongoDB Connected successfully →', conn.connection.host);
  } catch (err) {
    console.error('MongoDB connection attempt FAILED:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack?.substring(0, 300), // truncate for logs
    });

    // Simple retry after 2 seconds (only once per cold start)
    setTimeout(() => {
      console.log('Retrying MongoDB connection...');
      connectDB();
    }, 2000);
  }
};

// Start connection immediately (non-blocking)
connectDB();

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use(authRoutes);

// Health check with more debug info
app.get('/', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    message: 'JLABS API is running',
    environment: process.env.NODE_ENV || 'production',
    mongoStatus: states[readyState] || 'unknown',
    readyState,
    hasMongoUri: !!process.env.MONGO_URI,
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────
// Global error handler – prevents full function crash
// ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', {
    message: err.message,
    stack: err.stack?.substring(0, 400),
    url: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler – last
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;