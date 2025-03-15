// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Brand = require('../models/Brand');
const Influencer = require('../models/Influencer');

// =============== BRAND SIGNUP ===============
exports.signupBrand = async (req, res) => {
  try {
    // Extract fields from request body
    const {
      firstName,
      lastName,
      email,
      password,
      businessName,
      brandWebsite,
      industries,
      campaignGoals,
      budgetRange,
      platforms,
    } = req.body;

    // 1) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already taken' });
    }

    // 2) Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3) Create user doc => role=brand
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'brand',
    });

    // 4) Create brand doc
    const brandDoc = await Brand.create({
      userId: user._id,
      businessName,
      brandWebsite,
      industries,
      campaignGoals,
      budgetRange,
      platforms,
    });

    // 5) Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: 'brand' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      message: 'Brand signup successful',
      token,
      user,
      brandDoc,
    });
  } catch (error) {
    console.error('Error in signupBrand:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============== INFLUENCER SIGNUP ===============
exports.signupInfluencer = async (req, res) => {
  try {
    // Extract influencer + user fields from request body
    const {
      firstName,
      lastName,
      email,
      password,

      // Basic influencer fields
      name,
      experience,
      numFollowers,
      influencerLocation,
      majorityAudienceLocation,
      audienceAgeGroup,
      audienceGenderDemographics,
      gender,
      industries,

      // The array of selected platforms
      platforms,

      // The object storing handle + price for each platform
      // e.g. { "Instagram": { handle: "myInsta", price: 50 }, ... }
      platformDetails,
    } = req.body;

    // 1) Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already taken' });
    }

    // 2) Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3) Create user doc => role=influencer
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'influencer',
    });

    // 4) Create influencer doc referencing user
    //    note: the schema calls it "nichePlatforms" for the array
    //          and "platformDetails" for the handle/price map
    const influencerDoc = await Influencer.create({
      userId: user._id,
      name,
      experience,
      numFollowers,
      influencerLocation,
      majorityAudienceLocation,
      audienceAgeGroup,
      audienceGenderDemographics,
      gender,
      industries,

      nichePlatforms: platforms,   // array of strings
      platformDetails,            // map of subdocs
    });

    // 5) Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: 'influencer' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      message: 'Influencer signup successful',
      token,
      user,
      influencerDoc,
    });
  } catch (error) {
    console.error('Error in signupInfluencer:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============== LOGIN ===============
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2) Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3) Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4) Return
    return res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
