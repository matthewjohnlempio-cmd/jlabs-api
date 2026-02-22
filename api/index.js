const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// Dynamic CORS configuration – allows your frontend domains safely
const allowedOrigins = [
  'http://localhost:5173',          // Vite default local dev port
  'http://localhost:3000',
  'https://jlabs-web-six.vercel.app',
  // Add preview URLs if needed later, e.g. 'https://jlabs-web-six-*-yourusername.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200, // Fix for legacy browsers
}));

app.use(express.json());

// Connect to MongoDB – non-blocking, logs errors without crashing app
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message || err);
    // Do NOT process.exit() or throw here – Vercel will retry cold starts
  }
})();

// Routes – mounted at root (/login, etc.)
app.use(authRoutes);

// Health check route (for testing deployment)
app.get('/', (req, res) => {
  res.json({
    message: 'JLABS API is running',
    environment: process.env.NODE_ENV || 'production',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Global error handler – catches ANY unhandled errors to prevent full crash
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack || err.message || err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler – must be last
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;