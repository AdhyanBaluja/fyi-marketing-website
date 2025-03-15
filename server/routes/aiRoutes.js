// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth, requireBrand } = require('../middleware/authMiddleware');
const { generateCampaignPlan } = require('../controllers/aiController');

// Brand must be logged in => brand => generate campaign
router.post('/generateCampaign', requireAuth, requireBrand, generateCampaignPlan);

module.exports = router;
