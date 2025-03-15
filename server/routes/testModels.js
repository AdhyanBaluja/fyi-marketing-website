// routes/testModels.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Brand = require('../models/Brand');
const Influencer = require('../models/Influencer');

// Example brand signup test
router.post('/createBrand', async (req, res) => {
  try {
    // 1) Create user
    const user = await User.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      password: 'someHashedPassword', // in real code, you hash it
      role: 'brand',
    });

    // 2) Create brand doc
    const brand = await Brand.create({
      userId: user._id,
      businessName: 'Alice Fashion House',
      brandWebsite: 'https://alicefashions.com',
      industries: ['Beauty', 'Fashion'],
      campaignGoals: 'Promote new clothing line',
      budgetRange: '1000-5000 GBP',
      platforms: ['Instagram', 'Facebook'],
    });

    return res.json({ message: 'Brand created', user, brand });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error creating brand' });
  }
});

// Example influencer signup test
router.post('/createInfluencer', async (req, res) => {
  try {
    // 1) Create user
    const user = await User.create({
      firstName: 'Bob',
      lastName: 'Jones',
      email: 'bob@example.com',
      password: 'someHashedPassword',
      role: 'influencer',
    });

    // 2) Create influencer doc
    const influencer = await Influencer.create({
      userId: user._id,
      name: 'Bob the Influencer',
      experience: 3,
      numFollowers: 15000,
      influencerLocation: 'Los Angeles',
      majorityAudienceLocation: 'USA',
      audienceAgeGroup: '18-24',
      audienceGenderDemographics: '70% Female',
      gender: 'male',
      industries: ['Beauty', 'Lifestyle'],
      platforms: ['Instagram', 'TikTok'],
    });

    return res.json({ message: 'Influencer created', user, influencer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error creating influencer' });
  }
});

module.exports = router;
