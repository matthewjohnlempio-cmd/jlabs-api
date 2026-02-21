const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  // You can add more fields later: createdAt, role, etc.
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);