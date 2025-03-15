// models/Influencer.js

const mongoose = require('mongoose');

// For brand->influencer ratings
const RatingSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  ratingValue: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

// Sub-schema for tasks in joinedCampaign
const TaskSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  text: { type: String, default: '' },
  completed: { type: Boolean, default: false },
});

// Sub-schema for each joinedCampaign
const JoinedCampaignSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  joinedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['applied', 'active', 'completed', 'rejected'],
    default: 'applied',
  },
  campaignName: { type: String, default: '' },
  budget: { type: String, default: '' },
  platform: { type: String, default: '' },

  // tasks array
  tasks: [TaskSchema],
});

// Sub-schema for platform handle + price
const PlatformDetailSchema = new mongoose.Schema({
  handle: { type: String, default: '' },
  price: { type: Number, default: 0 },
}, { _id: false });

const InfluencerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true },
  experience: { type: Number, default: 0 },
  numFollowers: { type: Number, default: 0 },
  influencerLocation: { type: String, default: '' },
  majorityAudienceLocation: { type: String, default: '' },
  audienceAgeGroup: { type: String, default: '' },
  audienceGenderDemographics: { type: String, default: '' },
  gender: { type: String, default: '' },
  industries: [{ type: String }],

  // The array of selected platforms
  nichePlatforms: [{ type: String }],

  // The map storing handle + price for each platform
  platformDetails: {
    type: Map,
    of: PlatformDetailSchema,
    default: {},
  },

  // For storing an avatar image URL
  profileImage: { type: String, default: '' },

  // Ratings from brands
  ratings: [RatingSchema],
  averageRating: { type: Number, default: 0 },

  // The campaigns this influencer has joined (or applied)
  joinedCampaigns: [JoinedCampaignSchema],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Influencer', InfluencerSchema);
