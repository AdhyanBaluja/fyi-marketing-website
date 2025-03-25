// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['brand', 'influencer'],
    required: true,
  },
  // New fields for membership plan
  membershipPlan: {
    type: String,
    enum: ['Free', 'Standard', 'Premium'],
    default: 'Free',
  },
  
  planExpiresAt: { type: Date, default: null },
  // Array of strings for any features or items the user has access to
  accessItems: [
    {
      type: String,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
