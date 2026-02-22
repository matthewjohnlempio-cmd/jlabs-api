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
  'http://localhost:5173',           // Vite default local dev
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
// Global cached DB connection (Vercel serverless best practice)
// ──────────────────────────────────────────────
let cachedDb = global.mongoose;

if (!cachedDb) {
  cachedDb = global.mongoose = { conn: null, promise: null, lastError: null, lastAttempt: null };
}

const connectDB = async () => {
  if (cachedDb.conn && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedDb.conn;
  }

  // Prevent multiple simultaneous connect attempts
  if (cachedDb.promise) {
    console.log('Connection already in progress — awaiting existing promise');
    return cachedDb.promise;
  }

  cachedDb.lastAttempt = new Date().toISOString();

  const uri = process.env.MONGO_URI;
  if (!uri) {
    const err = new Error('MONGO_URI environment variable is missing');
    cachedDb.lastError = err.message;
    throw err;
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('MongoDB connection timed out after 10s')), 10000)
  );

  try {
    console.log('Attempting MongoDB connection...');
    cachedDb.promise = Promise.race([
      mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
        socketTimeoutMS: 20000,
        connectTimeoutMS: 10000,
        maxPoolSize: 5,
        minPoolSize: 1,
        family: 4,
        bufferCommands: false, // Prevent buffering timeouts
      }),
      timeoutPromise,
    ]).then((conn) => {
      cachedDb.conn = conn;
      cachedDb.lastError = null;
      console.log('MongoDB Connected successfully →', conn.connection.host);
      return conn;
    });

    await cachedDb.promise;
    return cachedDb.conn;
  } catch (err) {
    cachedDb.promise = null;
    cachedDb.lastError = {
      message: err.message,
      name: err.name,
      code: err.code,
      reason: err.reason ? JSON.stringify(err.reason) : undefined,
      stack: err.stack?.substring(0, 300),
    };
    console.error('MongoDB connection FAILED:', cachedDb.lastError);
    // Retry once after delay
    setTimeout(connectDB, 3000);
    throw err; // Let caller handle
  }
};

// Initialize connection early (non-blocking)
connectDB().catch((err) => console.error('Initial connection attempt failed:', err.message));

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use(authRoutes);

// Health check with detailed debug
app.get('/', async (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.json({
    message: 'JLABS API is running',
    environment: process.env.NODE_ENV || 'production',
    mongoStatus: states[readyState] || 'unknown',
    readyState,
    hasMongoUri: !!process.env.MONGO_URI,
    lastAttempt: cachedDb.lastAttempt || 'never',
    lastConnectionError: cachedDb.lastError || null,
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────
// Global error handler – prevents function crashes
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