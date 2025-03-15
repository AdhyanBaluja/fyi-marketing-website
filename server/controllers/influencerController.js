// controllers/influencerController.js

const Influencer = require('../models/Influencer');
const Campaign = require('../models/Campaign');
const Brand = require('../models/Brand');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

exports.getMyProfile = async (req, res) => {
  try {
    const influencer = await Influencer.findOne({ userId: req.user.userId });
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer profile not found' });
    }
    return res.json({ influencer });
  } catch (error) {
    console.error('Error fetching influencer profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const influencer = await Influencer.findOne({ userId: req.user.userId });
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    // Destructure profileImage along with the other fields
    const {
      profileImage,
      name,
      experience,
      numFollowers,
      influencerLocation,
      majorityAudienceLocation,
      audienceAgeGroup,
      audienceGenderDemographics,
      gender,
      industries,
      platforms,
      averageRating, // Typically not updated by influencer, but it's here
    } = req.body;

    if (profileImage !== undefined) influencer.profileImage = profileImage;
    if (name !== undefined) influencer.name = name;
    if (experience !== undefined) influencer.experience = experience;
    if (numFollowers !== undefined) influencer.numFollowers = numFollowers;
    if (influencerLocation !== undefined) influencer.influencerLocation = influencerLocation;
    if (majorityAudienceLocation !== undefined) {
      influencer.majorityAudienceLocation = majorityAudienceLocation;
    }
    if (audienceAgeGroup !== undefined) influencer.audienceAgeGroup = audienceAgeGroup;
    if (audienceGenderDemographics !== undefined) {
      influencer.audienceGenderDemographics = audienceGenderDemographics;
    }
    if (gender !== undefined) influencer.gender = gender;
    if (industries !== undefined) influencer.industries = industries;
    if (platforms !== undefined) influencer.nichePlatforms = platforms;

    if (averageRating !== undefined) {
      influencer.averageRating = averageRating;
    }

    await influencer.save();
    return res.json({ message: 'Influencer updated successfully', influencer });
  } catch (error) {
    console.error('Error updating influencer info:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/influencer/my-active-campaigns
 * => Only shows campaigns with status='active'
 * => Skips any campaign doc that's been physically deleted
 */
exports.getMyActiveCampaigns = async (req, res) => {
  try {
    const influencer = await Influencer.findOne({ userId: req.user.userId })
      .populate('joinedCampaigns.campaignId');

    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    // Only status='active', skip if campaign doc is gone
    const activeCampaigns = influencer.joinedCampaigns.filter((c) => {
      return c.status === 'active' && c.campaignId != null;
    });

    return res.json({ activeCampaigns });
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/influencer/all
 */
exports.listAllInfluencers = async (req, res) => {
  try {
    let all = await Influencer.find();

    const { search, minFollowers } = req.query;
    if (search) {
      const lowerSearch = search.toLowerCase();
      all = all.filter((inf) => inf.name.toLowerCase().includes(lowerSearch));
    }
    if (minFollowers) {
      all = all.filter((inf) => inf.numFollowers >= Number(minFollowers));
    }

    return res.json({ influencers: all });
  } catch (error) {
    console.error('Error listing influencers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/influencer/:id
 */
exports.getInfluencerById = async (req, res) => {
  try {
    const { id } = req.params;
    const influencer = await Influencer.findById(id)
      .populate('joinedCampaigns.campaignId');
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }
    return res.json({ influencer });
  } catch (error) {
    console.error('Error fetching influencer by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/influencer/brand-requests
 * => brand invites to this influencer (requestsToInfluencers)
 * => skip any physically deleted campaign doc
 */
exports.getBrandRequests = async (req, res) => {
  try {
    const influencer = await Influencer.findOne({ userId: req.user.userId });
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    // find campaigns that invited this influencer
    const campaigns = await Campaign.find({
      "requestsToInfluencers.influencerId": influencer._id
    });

    const requests = [];
    campaigns.forEach(camp => {
      camp.requestsToInfluencers.forEach(r => {
        if (r.influencerId.toString() === influencer._id.toString()) {
          requests.push({
            _id: r._id,
            campaignId: camp._id,
            campaignName: camp.name || 'Untitled',
            brandName: camp.brandName || 'N/A',
            budget: camp.budget || 'N/A',
            status: r.status
          });
        }
      });
    });

    return res.json({ requests });
  } catch (error) {
    console.error('Error fetching brand requests:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PATCH /api/influencer/brand-requests/:requestId/accept
 * => brand invited influencer => influencer accepts
 * => we change subdoc in requestsToInfluencers to status='accepted'
 * => we add campaign to influencer's joinedCampaigns with status='active'
 * => send email to brand
 */
exports.acceptBrandRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // 1) find influencer
    const influencer = await Influencer.findOne({ userId: req.user.userId });
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    // 2) find campaign that has requestsToInfluencers subdoc with _id=requestId
    const campaign = await Campaign.findOne({
      "requestsToInfluencers._id": requestId
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found for this request" });
    }

    // 3) find subdoc
    const requestSubdoc = campaign.requestsToInfluencers.find(
      (r) => r._id.toString() === requestId
    );
    if (!requestSubdoc) {
      return res.status(404).json({ error: "Request subdoc not found" });
    }

    if (requestSubdoc.status !== 'pending') {
      return res.status(400).json({ error: "This request has already been handled" });
    }

    // 4) Set status to 'accepted'
    requestSubdoc.status = 'accepted';
    await campaign.save();

    // 5) Add campaign to influencer's joinedCampaigns => status 'active'
    const alreadyJoined = influencer.joinedCampaigns.some(
      (c) => c.campaignId.toString() === campaign._id.toString()
    );
    if (!alreadyJoined) {
      influencer.joinedCampaigns.push({
        campaignId: campaign._id,
        status: 'active',
        progress: 0,
        campaignName: campaign.name || "Untitled",
        budget: campaign.budget || 'N/A',
        platform: 'Instagram'
      });
      await influencer.save();
    }

    // 6) Optional: send email to brand
    const brandUserId = campaign.userId;
    const brandUser = await User.findById(brandUserId);
    if (brandUser) {
      const subject = 'Influencer Accepted Your Campaign Invitation';
      const text = `Hello,\n\nInfluencer ${influencer.name} has accepted your invitation for campaign: "${campaign.name}".\n\nBest,\nPlatform Team.`;
      await sendEmail(brandUser.email, subject, text);
    }

    return res.json({
      message: "Request accepted and removed",
      campaign,
      influencer
    });
  } catch (error) {
    console.error("Error accepting brand request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /api/influencer/my-active-campaigns/:campaignId/progress
 */
exports.updateActiveCampaignProgress = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { progress } = req.body;

    const influencer = await Influencer.findOne({ userId: req.user.userId });
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    const joinedCamp = influencer.joinedCampaigns.find(
      (c) => c.campaignId.toString() === campaignId
    );
    if (!joinedCamp) {
      return res.status(404).json({ error: 'Campaign not found in influencer joinedCampaigns' });
    }

    joinedCamp.progress = Number(progress) || 0;
    await influencer.save();

    return res.json({ message: 'Progress updated successfully', influencer });
  } catch (error) {
    console.error('Error updating active campaign progress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * NEW: DELETE /api/influencer/my-active-campaigns/:campaignId/leave
 * => influencer leaves an active campaign
 */
exports.leaveActiveCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    // 1) Find influencer and remove the campaign from joinedCampaigns
    const influencer = await Influencer.findOne({ userId: req.user.userId });
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    influencer.joinedCampaigns = influencer.joinedCampaigns.filter(
      (c) => c.campaignId.toString() !== campaignId
    );
    await influencer.save();

    // 2) Find campaign doc and remove the influencer from subdocs
    const campaign = await Campaign.findById(campaignId);
    if (campaign) {
      campaign.requestsFromInfluencers = campaign.requestsFromInfluencers.filter(
        (r) => r.influencerId.toString() !== influencer._id.toString()
      );
      campaign.requestsToInfluencers = campaign.requestsToInfluencers.filter(
        (r) => r.influencerId.toString() !== influencer._id.toString()
      );
      await campaign.save();

      // 3) Send email to brand about the influencer leaving
      const brandUser = await User.findById(campaign.userId);
      if (brandUser) {
        const subject = 'Influencer Left Your Campaign';
        const text = `Hello,\n\nInfluencer ${influencer.name} has left your campaign: "${campaign.name}".\n\nBest,\nPlatform Team.`;
        await sendEmail(brandUser.email, subject, text);
      }
    }

    return res.json({ message: 'You have left the campaign successfully.' });
  } catch (error) {
    console.error('Error leaving active campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/influencer/:influencerId/rate
 */
exports.rateInfluencer = async (req, res) => {
  try {
    const { influencerId } = req.params;
    const { ratingValue } = req.body;

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ error: 'ratingValue must be between 1 and 5' });
    }

    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    const brand = await Brand.findOne({ userId: req.user.userId });
    if (!brand) {
      return res.status(403).json({ error: 'Not a valid brand or brand doc not found' });
    }

    const alreadyRated = influencer.ratings.some(
      (r) => r.brandId.toString() === brand._id.toString()
    );
    if (alreadyRated) {
      return res.status(400).json({ error: 'You have already rated this influencer' });
    }

    influencer.ratings.push({ brandId: brand._id, ratingValue });

    // recalc average
    const totalRatings = influencer.ratings.length;
    const sumRatings = influencer.ratings.reduce((acc, r) => acc + r.ratingValue, 0);
    influencer.averageRating = sumRatings / totalRatings;

    await influencer.save();
    return res.json({ message: 'Rating submitted', influencer });
  } catch (err) {
    console.error('Error rating influencer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/* ==============================
   ADDITIONAL: TASKS ENDPOINTS
   (You must also update your model 
    to have tasks[] in joinedCampaigns)
 ============================== */

/**
 * POST /api/influencer/my-active-campaigns/:campaignId/tasks
 * => Add a new task (text) to campaign's tasks array
 */
exports.addTaskToCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { text } = req.body;

    const influencer = await Influencer.findOne({ userId: req.user.userId });
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    // Find the subdoc for the given campaignId with status=active
    const joinedCamp = influencer.joinedCampaigns.find(
      (c) => c.campaignId.toString() === campaignId && c.status === 'active'
    );
    if (!joinedCamp) {
      return res.status(404).json({ error: 'No active campaign found with that ID' });
    }

    // tasks array is an array of { _id, text, completed, ... }
    joinedCamp.tasks = joinedCamp.tasks || [];
    joinedCamp.tasks.push({
      text,
      completed: false,
    });

    await influencer.save();

    return res.json({
      message: 'Task added successfully',
      tasks: joinedCamp.tasks,
    });
  } catch (error) {
    console.error('Error adding task to campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/influencer/my-active-campaigns/:campaignId/tasks/:taskId
 * => Remove a task from the campaign's tasks array
 */
exports.removeTaskFromCampaign = async (req, res) => {
  try {
    const { campaignId, taskId } = req.params;

    const influencer = await Influencer.findOne({ userId: req.user.userId });
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    const joinedCamp = influencer.joinedCampaigns.find(
      (c) => c.campaignId.toString() === campaignId && c.status === 'active'
    );
    if (!joinedCamp) {
      return res.status(404).json({ error: 'No active campaign found with that ID' });
    }

    joinedCamp.tasks = joinedCamp.tasks.filter(
      (t) => t._id.toString() !== taskId
    );

    await influencer.save();

    return res.json({
      message: 'Task removed successfully',
      tasks: joinedCamp.tasks,
    });
  } catch (error) {
    console.error('Error removing task from campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
