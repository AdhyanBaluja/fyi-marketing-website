// routes/influencerRoutes.js

const express = require('express');
const router = express.Router();
const { requireAuth, requireInfluencer, requireBrand } = require('../middleware/authMiddleware');

const {
  getMyProfile,
  updateMyProfile,
  getMyActiveCampaigns,
  listAllInfluencers,
  getBrandRequests,
  acceptBrandRequest,
  updateActiveCampaignProgress,
  leaveActiveCampaign,
  rateInfluencer,
  getInfluencerById,
  addTaskToCampaign,
  removeTaskFromCampaign
} = require('../controllers/influencerController');

/**
 * GET /api/influencer/my-profile
 */
router.get('/my-profile', requireAuth, requireInfluencer, getMyProfile);

/**
 * PATCH /api/influencer/my-profile
 */
router.patch('/my-profile', requireAuth, requireInfluencer, updateMyProfile);

/**
 * GET /api/influencer/my-active-campaigns
 */
router.get('/my-active-campaigns', requireAuth, requireInfluencer, getMyActiveCampaigns);

/**
 * GET /api/influencer/all
 */
router.get('/all', listAllInfluencers);

/**
 * GET /api/influencer/brand-requests
 */
router.get('/brand-requests', requireAuth, requireInfluencer, getBrandRequests);

/**
 * PATCH /api/influencer/brand-requests/:requestId/accept
 */
router.patch('/brand-requests/:requestId/accept', requireAuth, requireInfluencer, acceptBrandRequest);

/**
 * PATCH /api/influencer/my-active-campaigns/:campaignId/progress
 */
router.patch('/my-active-campaigns/:campaignId/progress', requireAuth, requireInfluencer, updateActiveCampaignProgress);

/**
 * DELETE /api/influencer/my-active-campaigns/:campaignId/leave
 */
router.delete('/my-active-campaigns/:campaignId/leave', requireAuth, requireInfluencer, leaveActiveCampaign);

/**
 * POST /api/influencer/:influencerId/rate
 */
router.post('/:influencerId/rate', requireAuth, requireBrand, rateInfluencer);

/**
 * GET /api/influencer/:id
 */
router.get('/:id', getInfluencerById);

// influencerRoutes.js
// routes/influencerRoutes.js

router.post(
  '/my-active-campaigns/:campaignId/tasks',
  requireAuth,        // <--- make sure this is present
  requireInfluencer,  // <--- and the correct role check
  addTaskToCampaign   // <--- your controller function
);

router.delete('/my-active-campaigns/:campaignId/tasks/:taskId',requireAuth, requireInfluencer, removeTaskFromCampaign);



module.exports = router;
