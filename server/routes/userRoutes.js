// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware'); 
const {
  upgradePlan,
  grantAccessItem,
  getUserById // <-- We'll define this in userController
} = require('../controllers/userController');

// GET /api/users/:userId
// Returns the user doc, including membershipPlan, etc.
router.get('/:userId', requireAuth, getUserById);

// Suppose brand or admin can call these endpoints:
router.patch('/:userId/upgradePlan', requireAuth, upgradePlan);
router.patch('/:userId/grantItem', requireAuth, grantAccessItem);

module.exports = router;
