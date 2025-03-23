const Campaign = require('../models/Campaign');
const Influencer = require('../models/Influencer');
const User = require('../models/User');
const Brand = require('../models/Brand'); // <— ADDED to fetch brand name
const { sendEmail } = require('../utils/emailService');

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
        profileImage: inf.profileImage,
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
      campaignImage,
    } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

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
    if (campaignImage !== undefined) campaign.campaignImage = campaignImage;

    // formInputs subdoc => merge approach
    if (formInputs !== undefined) {
      if (!campaign.formInputs) campaign.formInputs = {};
      for (const [key, val] of Object.entries(formInputs)) {
        campaign.formInputs[key] = val;
      }
    }

    await campaign.save();
    return res.json({ message: 'Campaign updated successfully', campaign });
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

    // 2) Also update campaign => requestsFromInfluencers
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

/**
 * PATCH /api/campaigns/:campaignId
 * Only brand can update campaign requests by accepting influencer applications.
 */
exports.acceptInboundRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // 1) Find campaign with matching subdoc
    const campaign = await Campaign.findOne({
      userId: req.user.userId,
      "requestsFromInfluencers._id": requestId
    });
    if (!campaign) {
      return res
        .status(404)
        .json({ error: 'Request/campaign not found or not owned by you' });
    }

    // 2) Find subdoc
    const subdoc = campaign.requestsFromInfluencers.find(
      (r) => r._id.toString() === requestId
    );
    if (!subdoc) {
      return res.status(404).json({ error: 'Request subdoc not found' });
    }

    if (subdoc.status !== 'applied') {
      return res
        .status(400)
        .json({ error: 'This request is not in "applied" status.' });
    }

    const influencerId = subdoc.influencerId;

    // 3) Update subdoc => 'active'
    subdoc.status = 'active';
    await campaign.save();

    // 4) Update influencer doc => joinedCampaigns => 'active'
    const influencerDoc = await Influencer.findById(influencerId);
    if (!influencerDoc) {
      return res.status(404).json({ error: 'Influencer doc not found' });
    }

    const joined = influencerDoc.joinedCampaigns.find(
      (jc) => jc.campaignId.toString() === campaign._id.toString()
    );
    if (joined) {
      joined.status = 'active';
    } else {
      influencerDoc.joinedCampaigns.push({
        campaignId: campaign._id,
        status: 'active',
        progress: 0,
        campaignName: campaign.name || 'Untitled',
        budget: campaign.budget || 'N/A',
        platform: 'Instagram'
      });
    }
    await influencerDoc.save();

    // (Optional) Fetch brand doc to mention brand name
    const brandDoc = await Brand.findOne({ userId: req.user.userId });

    // 5) Send email to influencer
    const influencerUser = await User.findById(influencerDoc.userId);
    if (influencerUser) {
      const subject = brandDoc
        ? `Your application was accepted by ${brandDoc.businessName}!`
        : 'Your application was accepted!';
      const text = `Hello ${influencerDoc.name},\n\nYour application for the campaign "${campaign.name}"${
        brandDoc ? ` from ${brandDoc.businessName}` : ''
      } has been accepted!\n\nBest,\nPlatform Team.`;

      await sendEmail(influencerUser.email, subject, text);
    }

    return res.json({ message: 'Inbound request accepted', campaign });
  } catch (err) {
    console.error('Error accepting inbound request:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/brand/campaigns/:campaignId/influencers/:influencerId
 * -> brand can remove an influencer from a campaign
 * -> remove influencer from requestsFromInfluencers or requestsToInfluencers (if found)
 * -> remove campaign from influencer's joinedCampaigns
 * -> send an email to the influencer about removal
 */
exports.removeJoinedInfluencer = async (req, res) => {
  try {
    const { campaignId, influencerId } = req.params;

    // 1) Find campaign that belongs to brand
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user.userId
    });
    if (!campaign) {
      return res
        .status(404)
        .json({ error: 'Campaign not found or not owned by you' });
    }

    // 2) Remove from subdocs
    campaign.requestsFromInfluencers = campaign.requestsFromInfluencers.filter(
      (r) => r.influencerId.toString() !== influencerId
    );
    campaign.requestsToInfluencers = campaign.requestsToInfluencers.filter(
      (r) => r.influencerId.toString() !== influencerId
    );
    await campaign.save();

    // 3) Remove from influencer doc
    const influencerDoc = await Influencer.findById(influencerId);
    if (!influencerDoc) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    influencerDoc.joinedCampaigns = influencerDoc.joinedCampaigns.filter(
      (jc) => jc.campaignId.toString() !== campaignId
    );
    await influencerDoc.save();

    // (Optional) fetch brand doc to mention brand name
    const brandDoc = await Brand.findOne({ userId: req.user.userId });

    // 4) Email influencer about removal
    const userDoc = await User.findById(influencerDoc.userId);
    if (userDoc) {
      const subject = brandDoc
        ? `Removed from a ${brandDoc.businessName} campaign`
        : 'You have been removed from a campaign';
      const text = `Hello ${influencerDoc.name},\n\nYou have been removed from the campaign "${campaign.name}"${
        brandDoc ? ` by ${brandDoc.businessName}` : ''
      }. If you have any questions, please contact the brand.\n\nBest,\nPlatform Team.`;
      await sendEmail(userDoc.email, subject, text);
    }

    return res.json({ message: 'Influencer removed from campaign successfully' });
  } catch (err) {
    console.error('Error removing joined influencer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
