// routes/brandRoutes.js

const express = require('express');
const router = express.Router();
const { requireAuth, requireBrand } = require('../middleware/authMiddleware');

const {
  getMyProfile,
  updateMyProfile,
  getMyCampaigns,
  getBrandDashboard,
  createBrandCampaign,
  getBrandRequests,
  inviteInfluencer,
  updateCampaignByBrand,
  deleteCampaignByBrand,
  getAllActiveEvents,
  getJoinedInfluencersForAllCampaigns,
  acceptInboundRequest,
  removeJoinedInfluencer, // <-- NEW
} = require('../controllers/brandController');

// Existing brand routes
router.get('/my-profile', requireAuth, requireBrand, getMyProfile);
router.patch('/my-profile', requireAuth, requireBrand, updateMyProfile);
router.get('/my-campaigns', requireAuth, requireBrand, getMyCampaigns);
router.get('/dashboard', requireAuth, requireBrand, getBrandDashboard);
router.post('/create-campaign', requireAuth, requireBrand, createBrandCampaign);
router.get('/requests', requireAuth, requireBrand, getBrandRequests);
router.post('/invite-influencer', requireAuth, requireBrand, inviteInfluencer);

// NEW routes for updating or deleting a campaign
router.patch('/campaigns/:campaignId', requireAuth, requireBrand, updateCampaignByBrand);
router.delete('/campaigns/:campaignId', requireAuth, requireBrand, deleteCampaignByBrand);

// NEW route for brand-level active events
router.get('/active-events', requireAuth, requireBrand, getAllActiveEvents);

// NEW route for joined influencers
router.get('/joinedInfluencers', requireAuth, requireBrand, getJoinedInfluencersForAllCampaigns);

// NEW: Route for accepting an inbound influencer request
router.patch('/requests/:requestId/accept', requireAuth, requireBrand, acceptInboundRequest);

// NEW: Route to remove an influencer from a campaign
router.delete(
  '/campaigns/:campaignId/influencers/:influencerId',
  requireAuth,
  requireBrand,
  removeJoinedInfluencer
);

module.exports = router;
