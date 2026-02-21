const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://jlabs-web-six.vercel.app',
    // Add more frontend domains if needed later
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,           // if you ever use cookies/sessions
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use(authRoutes);           // ← routes are mounted at root of the function (/api/login becomes /login)

// Optional: simple health check / root route
app.get('/', (req, res) => {
  res.json({
    message: 'JLABS API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler (optional but nice)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;