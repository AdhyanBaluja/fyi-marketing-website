// routes/campaignRoutes.js

const express = require('express');
const router = express.Router();
const { requireAuth, requireBrand } = require('../middleware/authMiddleware');
const {
  listAllCampaigns,
  createCampaign,
  getCampaignDetail,
  updateCampaign,
  deleteCampaign,
  applyToCampaign,
} = require('../controllers/campaignController');

/**
 * GET /api/campaigns
 * Everyone with a valid token can see all campaigns
 */
router.get('/', requireAuth, listAllCampaigns);

/**
 * POST /api/campaigns
 * Only brand can create
 */
router.post('/', requireAuth, requireBrand, createCampaign);

/**
 * GET /api/campaigns/:campaignId
 */
router.get('/:campaignId', requireAuth, getCampaignDetail);

/**
 * PATCH /api/campaigns/:campaignId
 * Only brand can update
 */
router.patch('/:campaignId', requireAuth, requireBrand, updateCampaign);

/**
 * DELETE /api/campaigns/:campaignId
 * Only brand can delete
 */
router.delete('/:campaignId', requireAuth, requireBrand, deleteCampaign);

/**
 * POST /api/campaigns/:campaignId/apply
 * Influencer can apply to a brand's campaign
 */
router.post('/:campaignId/apply', requireAuth, applyToCampaign);

module.exports = router;
