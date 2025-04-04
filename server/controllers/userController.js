const User = require('../models/User');

// Upgrade a user's membership plan
exports.upgradePlan = async (req, res) => {
  try {
    const userId = req.params.userId; // e.g., /api/users/:userId/upgradePlan
    const { newPlan } = req.body;     // e.g., { "newPlan": "Pro" }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update membershipPlan
    user.membershipPlan = newPlan;
    await user.save();

    return res.json({
      message: `Plan upgraded to ${newPlan} successfully`,
      user,
    });
  } catch (error) {
    console.error('Error upgrading plan:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a user by ID, excluding sensitive fields and checking for plan expiration
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user's plan has expired
    if (user.planExpiresAt && user.planExpiresAt < new Date()) {
      user.membershipPlan = 'Free';
      user.planExpiresAt = null;
      await user.save();
    }

    return res.json({ user });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Grant a user an access item or feature
exports.grantAccessItem = async (req, res) => {
  try {
    const userId = req.params.userId;  // e.g., /api/users/:userId/grantItem
    const { item } = req.body;         // e.g., { "item": "advancedCampaignAI" }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add the item if it's not already present
    if (!user.accessItems.includes(item)) {
      user.accessItems.push(item);
    }
    await user.save();

    return res.json({
      message: `Access item "${item}" granted`,
      user,
    });
  } catch (error) {
    console.error('Error granting item:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
