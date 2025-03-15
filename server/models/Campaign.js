// models/Campaign.js

const mongoose = require('mongoose');

// Subdoc for brand → influencer "invite" request
const InviteRequestSchema = new mongoose.Schema({
  influencerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

// Subdoc for influencer → brand "application" request
const InboundRequestSchema = new mongoose.Schema({
  influencerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' },
  status: {
    type: String,
    enum: ['applied', 'active', 'completed', 'rejected'],
    default: 'applied',
  },
  appliedAt: { type: Date, default: Date.now },
});

const CampaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Store the brand's name so that influencers see the correct brand name
  brandName: { type: String, default: '', trim: true },

  // Type of campaign from the AI builder
  campaignType: {
    type: String,
    enum: [
      'amplify',
      'marketProduct',
      'driveSales',
      'findNewCustomers',
      'driveEventAwareness',
      'custom'
    ],
    default: 'custom',
  },

  name: { type: String, trim: true },
  campaignImage: { type: String, default: '' },
  objective: { type: String, trim: true },
  targetAudience: { type: String, trim: true },
  duration: { type: String, trim: true },
  budget: { type: String, trim: true },
  influencerCollaboration: { type: String, trim: true },
  aboutCampaign: { type: String, trim: true },

  status: { type: String, default: 'Draft' },

  aiResponse: { type: String, default: '', trim: true },
  calendarEvents: [{ type: mongoose.Schema.Types.Mixed }],
  bingoSuggestions: [{ type: mongoose.Schema.Types.Mixed }],
  moreAdvice: [{ type: mongoose.Schema.Types.Mixed }],

  // brand -> influencer invites
  requestsToInfluencers: [InviteRequestSchema],
  // influencer -> brand applications
  requestsFromInfluencers: [InboundRequestSchema],

  // Sub-object to store original AI form inputs
  formInputs: {
    businessDescription: { type: String, default: '', trim: true },
    industry: { type: String, default: '', trim: true },
    timeframeStart: { type: String, default: '', trim: true },
    timeframeEnd: { type: String, default: '', trim: true },
    platforms: { type: String, default: '', trim: true },
    marketTrends: { type: String, default: '', trim: true },
    targetAudience: { type: String, default: '', trim: true },
    brandUSP: { type: String, default: '', trim: true },

    // Additional fields (if used)
    product: { type: String, default: '', trim: true },
    productFeatures: { type: String, default: '', trim: true },
    salesProductOrService: { type: String, default: '', trim: true },
    promotionalOffers: { type: String, default: '', trim: true },
    salesLocation: { type: String, default: '', trim: true },
    exploringNewSegments: { type: String, default: '', trim: true },
    newCustomerValueProp: { type: String, default: '', trim: true },
    eventName: { type: String, default: '', trim: true },
    eventUniqueness: { type: String, default: '', trim: true },
  },

  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('Campaign', CampaignSchema);
