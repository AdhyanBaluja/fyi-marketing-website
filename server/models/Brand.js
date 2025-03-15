// models/Brand.js
const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  // Link back to the user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Additional brand fields from the form
  businessName: {
    type: String,
    required: [true, 'Business Name is required'],
    trim: true, // remove extra whitespace
  },
  brandWebsite: {
    type: String,
    default: '',
    trim: true,
  },
  industries: [
    {
      type: String,
      trim: true,
    },
  ],
  campaignGoals: {
    type: String, // "Define Your Campaign Goals" text
    default: '',
    trim: true,
  },
  budgetRange: {
    type: String, // e.g. "1000-5000 GBP"
    default: '',
    trim: true,
  },
  platforms: [
    {
      type: String,
      trim: true,
    },
  ],
  // createdAt if you want
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Brand', BrandSchema);
