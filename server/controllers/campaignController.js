// controllers/campaignController.js

const Campaign = require('../models/Campaign');
const Influencer = require('../models/Influencer');


/**
 * GET /api/campaigns
 * Only returns active campaigns
 */
exports.listAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'Active' });
    return res.json({ campaigns });
  } catch (error) {
    console.error('Error listing campaigns:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


/**
 * POST /api/campaigns
 * Only brand can create
 */
exports.createCampaign = async (req, res) => {
  try {
    const {
      name,
      objective,
      targetAudience,
      duration,
      budget,
      influencerCollaboration,
      aboutCampaign,
      aiResponse,
      calendarEvents,
      bingoSuggestions,
      status,
      formInputs,
    } = req.body;

    const campaignDoc = await Campaign.create({
      userId: req.user.userId,
      name,
      objective,
      targetAudience,
      duration,
      budget,
      influencerCollaboration,
      aboutCampaign,
      aiResponse,
      calendarEvents,
      bingoSuggestions,
      status: status || 'Draft',
      formInputs: formInputs || {},
    });

    return res.status(201).json({ campaign: campaignDoc });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/campaigns/:campaignId
 * => Also attaches joinedInfluencers with progress & tasks
 */
exports.getCampaignDetail = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const influencerDocs = await Influencer.find({
      'joinedCampaigns.campaignId': campaignId,
      'joinedCampaigns.status': 'active',
    }).lean();

    const joinedInfluencers = influencerDocs.map((inf) => {
      const subdoc = inf.joinedCampaigns.find(
        (jc) => jc.campaignId.toString() === campaignId
      );
      return {
        _id: inf._id,
        name: inf.name,
        profileImage: inf.profileImage, // include the influencer's profileImage
        progress: subdoc?.progress ?? 0,
        tasks: subdoc?.tasks ?? [],
      };
    });

    campaign.joinedInfluencers = joinedInfluencers;
    return res.json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign detail:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
/**
 * PATCH /api/campaigns/:campaignId
 * Only brand can update
 */
exports.updateCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const {
      name,
      objective,
      targetAudience,
      duration,
      budget,
      influencerCollaboration,
      aboutCampaign,
      aiResponse,
      calendarEvents,
      bingoSuggestions,
      status,
      progress,
      clicks,
      conversions,
      formInputs,

      // NEW:
      campaignImage,
    } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Existing top-level fields
    if (name !== undefined) campaign.name = name;
    if (objective !== undefined) campaign.objective = objective;
    if (targetAudience !== undefined) campaign.targetAudience = targetAudience;
    if (duration !== undefined) campaign.duration = duration;
    if (budget !== undefined) campaign.budget = budget;
    if (influencerCollaboration !== undefined) {
      campaign.influencerCollaboration = influencerCollaboration;
    }
    if (aboutCampaign !== undefined) campaign.aboutCampaign = aboutCampaign;
    if (aiResponse !== undefined) campaign.aiResponse = aiResponse;
    if (calendarEvents !== undefined) campaign.calendarEvents = calendarEvents;
    if (bingoSuggestions !== undefined) campaign.bingoSuggestions = bingoSuggestions;
    if (status !== undefined) campaign.status = status;
    if (progress !== undefined) campaign.progress = progress;
    if (clicks !== undefined) campaign.clicks = clicks;
    if (conversions !== undefined) campaign.conversions = conversions;

    // NEW: set campaignImage if provided
    if (campaignImage !== undefined) {
      campaign.campaignImage = campaignImage;
    }

    // subdoc: formInputs (merge approach)
    if (formInputs !== undefined) {
      if (!campaign.formInputs) campaign.formInputs = {};
      for (const [key, val] of Object.entries(formInputs)) {
        campaign.formInputs[key] = val;
      }
    }

    await campaign.save();
    return res.json({ message: 'Campaign updated', campaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/campaigns/:campaignId
 * Only brand can delete
 */
exports.deleteCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    await Campaign.findByIdAndDelete(campaignId);
    return res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/campaigns/:campaignId/apply
 * Influencer can apply to brand's campaign
 * => Also update campaign.requestsFromInfluencers so brand sees "applied"
 */
exports.applyToCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const influencer = await Influencer.findOne({ userId: req.user.userId });
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer profile not found' });
    }
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // 1) Add to influencer doc => status: 'applied'
    influencer.joinedCampaigns.push({
      campaignId: campaign._id,
      status: 'applied',
      progress: 0,
      campaignName: campaign.name,
      budget: campaign.budget,
      platform: 'Instagram',
    });
    await influencer.save();

    // 2) Also add subdoc to campaign doc => brand sees 'applied'
    campaign.requestsFromInfluencers.push({
      influencerId: influencer._id,
      status: 'applied',
      appliedAt: new Date(),
    });
    await campaign.save();

    return res.json({
      message: 'Successfully applied to campaign',
      influencer,
    });
  } catch (error) {
    console.error('Error applying to campaign (campaignController):', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
