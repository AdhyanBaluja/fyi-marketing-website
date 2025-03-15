// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/paymentController');

// POST /api/payment/checkout
// Creates a Stripe Checkout session
router.post('/checkout', createCheckoutSession);

module.exports = router;
