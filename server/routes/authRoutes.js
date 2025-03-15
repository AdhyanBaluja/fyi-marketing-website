// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signupBrand, signupInfluencer, login } = require('../controllers/authController');

// POST /api/auth/signup/brand
router.post('/signup/brand', signupBrand);

// POST /api/auth/signup/influencer
router.post('/signup/influencer', signupInfluencer);

// POST /api/auth/login
router.post('/login', login);

module.exports = router;
