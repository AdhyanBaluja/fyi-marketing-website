const Brand = require('../models/Brand');
const Campaign = require('../models/Campaign');
const Influencer = require('../models/Influencer');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

exports.getMyProfile = async (req, res) => {
  try {
    const brand = await Brand.findOne({ userId: req.user.userId });
    if (!brand) {
      return res.status(404).json({ error: 'Brand profile not found' });
    }
    return res.json({ brand });
  } catch (error) {
    console.error('Error fetching brand profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const brand = await Brand.findOne({ userId: req.user.userId });
    if (!brand) {
      return res.status(404).json({ error: 'Brand profile not found' });
    }

    const {
      businessName,
      brandWebsite,
      industries,
      campaignGoals,
      budgetRange,
      platforms,
    } = req.body;

    if (businessName !== undefined) brand.businessName = businessName;
    if (brandWebsite !== undefined) brand.brandWebsite = brandWebsite;
    if (industries !== undefined) brand.industries = industries;
    if (campaignGoals !== undefined) brand.campaignGoals = campaignGoals;
    if (budgetRange !== undefined) brand.budgetRange = budgetRange;
    if (platforms !== undefined) brand.platforms = platforms;

    await brand.save();
    return res.json({ message: 'Brand profile updated', brand });
  } catch (error) {
    console.error('Error updating brand info:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.userId });
    return res.json({ campaigns });
  } catch (error) {
    console.error('Error fetching brand campaigns:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBrandDashboard = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.userId });
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;
    const draftPaused = campaigns.filter((c) => c.status !== 'Active').length;

    return res.json({
      totalCampaigns,
      activeCampaigns,
      draftPaused,
      campaigns,
    });
  } catch (error) {
    console.error('Error fetching brand dashboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * CREATE a new campaign.
 * We now set the campaign's brandName using the brand's stored businessName.
 */
exports.createBrandCampaign = async (req, res) => {
  try {
    const brandDoc = await Brand.findOne({ userId: req.user.userId });
    if (!brandDoc) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const {
      name,
      objective,
      targetAudience,
      duration,
      budget,
      influencerCollaboration,
      aboutCampaign,
      progress,
      clicks,
      conversions,
      status,
    } = req.body;

    const campaignDoc = await Campaign.create({
      userId: req.user.userId,
      brandName: brandDoc.businessName,
      name,
      objective,
      targetAudience,
      duration,
      budget,
      influencerCollaboration,
      aboutCampaign,
      progress: progress || 0,
      clicks: clicks || 0,
      conversions: conversions || 0,
      status: status || 'Active',
    });

    return res.status(201).json({ campaign: campaignDoc });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/brand/requests
 */
exports.getBrandRequests = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.userId })
      .populate('requestsToInfluencers.influencerId', 'name influencerLocation')
      .populate('requestsFromInfluencers.influencerId', 'name influencerLocation');

    const requestsByCampaign = campaigns.map((camp) => ({
      campaignId: camp._id,
      campaignName: camp.name,
      brandName: camp.brandName,
      requestsToInfluencers: camp.requestsToInfluencers,
      requestsFromInfluencers: camp.requestsFromInfluencers,
    }));

    return res.json({ requestsByCampaign });
  } catch (error) {
    console.error('Error fetching brand requests:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/brand/invite-influencer
 */
exports.inviteInfluencer = async (req, res) => {
  try {
    const { campaignId, influencerId } = req.body;
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user.userId,
    });
    if (!campaign) {
      return res
        .status(404)
        .json({ error: 'Campaign not found or not owned by you' });
    }

    const alreadyInvited = campaign.requestsToInfluencers.some(
      (r) => r.influencerId.toString() === influencerId
    );
    if (alreadyInvited) {
      return res
        .status(400)
        .json({ error: 'Influencer already invited to this campaign' });
    }

    // Add influencer to requestsToInfluencers
    campaign.requestsToInfluencers.push({ influencerId, status: 'pending' });
    await campaign.save();

    // Retrieve brand name (optional: if you want to mention brand in email)
    const brandDoc = await Brand.findOne({ userId: req.user.userId });

    // Send email to influencer
    const influencerDoc = await Influencer.findById(influencerId);
    if (influencerDoc) {
      const userDoc = await User.findById(influencerDoc.userId);
      if (userDoc) {
        const subject = brandDoc
          ? `New Campaign Invite from ${brandDoc.businessName}`
          : 'You have a new campaign invite!';
        const text = `Hello,\n\nYou have been invited to the campaign "${campaign.name}"${
          brandDoc ? ` by ${brandDoc.businessName}` : ''
        }. Please log in and check your brand requests.\n\nBest,\nPlatform Team.`;

        await sendEmail(userDoc.email, subject, text);
      }
    }

    return res.json({ message: 'Influencer invited successfully', campaign });
  } catch (error) {
    console.error('Error inviting influencer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PATCH /api/brand/campaigns/:campaignId
 */
exports.updateCampaignByBrand = async (req, res) => {
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
      progress,
      clicks,
      conversions,
      status,
    } = req.body;

    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user.userId,
    });
    if (!campaign) {
      return res
        .status(404)
        .json({ error: 'Campaign not found or not owned by you' });
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
    if (progress !== undefined) campaign.progress = progress;
    if (clicks !== undefined) campaign.clicks = clicks;
    if (conversions !== undefined) campaign.conversions = conversions;
    if (status !== undefined) campaign.status = status;

    // Optionally re-set brandName if the brand's name has changed
    const brandDoc = await Brand.findOne({ userId: req.user.userId });
    if (brandDoc) {
      campaign.brandName = brandDoc.businessName;
    }

    await campaign.save();
    return res.json({ message: 'Campaign updated successfully', campaign });
  } catch (error) {
    console.error('Error updating campaign by brand:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/brand/campaigns/:campaignId
 */
exports.deleteCampaignByBrand = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user.userId,
    });
    if (!campaign) {
      return res
        .status(404)
        .json({ error: 'Campaign not found or not owned by you' });
    }

    await Campaign.findByIdAndDelete(campaignId);
    return res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/brand/active-events
 */
exports.getAllActiveEvents = async (req, res) => {
  try {
    const activeCamps = await Campaign.find({
      userId: req.user.userId,
      status: 'Active',
    });

    let allEvents = [];
    activeCamps.forEach((camp) => {
      if (camp.calendarEvents && camp.calendarEvents.length > 0) {
        const mapped = camp.calendarEvents.map((ev) => ({
          ...ev,
          campaignId: camp._id,
          campaignName: camp.name,
        }));
        allEvents = [...allEvents, ...mapped];
      }
    });

    return res.json({ events: allEvents });
  } catch (error) {
    console.error('Error fetching all active events for brand:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/brand/joinedInfluencers
 */
exports.getJoinedInfluencersForAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.userId })
      .populate('requestsToInfluencers.influencerId', 'name profileImage')
      .populate('requestsFromInfluencers.influencerId', 'name profileImage');

    const result = campaigns.map((camp) => {
      // brand->influencer invites => status 'accepted'
      const acceptedTo = camp.requestsToInfluencers
        .filter((r) => r.status === 'accepted')
        .map((r) => ({
          influencerId: r.influencerId?._id,
          name: r.influencerId?.name,
          profileImage: r.influencerId?.profileImage,
          source: 'brandInvite',
        }));

      // influencer->brand => 'active'
      const activeFrom = camp.requestsFromInfluencers
        .filter((r) => r.status === 'active')
        .map((r) => ({
          influencerId: r.influencerId?._id,
          name: r.influencerId?.name,
          profileImage: r.influencerId?.profileImage,
          source: 'influencerApply',
        }));

      return {
        campaignId: camp._id,
        campaignName: camp.name,
        joinedInfluencers: [...acceptedTo, ...activeFrom],
      };
    });

    return res.json({ campaigns: result });
  } catch (error) {
    console.error('Error fetching joined influencers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PATCH /api/brand/requests/:requestId/accept
 * -> brand accepts an influencer's "requestsFromInfluencers"
 * -> sets subdoc.status='active' instead of removing
 * -> update influencer's joinedCampaigns => status='active'
 * -> send email to influencer
 */
exports.acceptInboundRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find campaign with matching subdoc
    const campaign = await Campaign.findOne({
      userId: req.user.userId,
      "requestsFromInfluencers._id": requestId,
    });
    if (!campaign) {
      return res
        .status(404)
        .json({ error: 'Request/campaign not found or not owned by you' });
    }

    // Find the subdocument within requestsFromInfluencers
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

    // Update subdoc status to 'active'
    subdoc.status = 'active';
    await campaign.save();

    // Update influencer doc => set joinedCampaigns status to 'active'
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
        platform: 'Instagram',
      });
    }
    await influencerDoc.save();

    // (Optional) retrieve brand name for email text
    const brandDoc = await Brand.findOne({ userId: req.user.userId });

    // Send email to influencer
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

    // 1) Find the campaign that belongs to the brand
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user.userId,
    });
    if (!campaign) {
      return res
        .status(404)
        .json({ error: 'Campaign not found or not owned by you' });
    }

    // 2) Remove from requestsFromInfluencers / requestsToInfluencers
    campaign.requestsFromInfluencers = campaign.requestsFromInfluencers.filter(
      (r) => r.influencerId.toString() !== influencerId
    );
    campaign.requestsToInfluencers = campaign.requestsToInfluencers.filter(
      (r) => r.influencerId.toString() !== influencerId
    );
    await campaign.save();

    // 3) Remove from influencer's joinedCampaigns
    const influencerDoc = await Influencer.findById(influencerId);
    if (!influencerDoc) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    influencerDoc.joinedCampaigns = influencerDoc.joinedCampaigns.filter(
      (jc) => jc.campaignId.toString() !== campaignId
    );
    await influencerDoc.save();

    // 4) Send an email to the influencer about removal
    const userDoc = await User.findById(influencerDoc.userId);
    if (userDoc) {
      const subject = 'You have been removed from a campaign';
      const text = `Hello ${influencerDoc.name},\n\nYou have been removed from the campaign "${campaign.name}". If you have any questions, please contact the brand.\n\nBest,\nPlatform Team.`;
      await sendEmail(userDoc.email, subject, text);
    }

    return res.json({ message: 'Influencer removed from campaign successfully' });
  } catch (err) {
    console.error('Error removing joined influencer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
