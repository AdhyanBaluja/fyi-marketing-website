const fs = require('fs');
const path = require('path');

/**
 * Get influencers filtered by industry
 * 
 * @param {string} industry - The industry to filter by
 * @param {number} limit - Maximum number of influencers to return (default: 3)
 * @param {boolean} topOnly - Whether to return only top influencers (default: true)
 * @returns {Array} Array of influencer objects
 */
const getInfluencersByIndustry = (industry, limit = 3, topOnly = true) => {
  try {
    // Read influencers data from JSON file
    const influencersFilePath = path.join(__dirname, '../data/influencers.json');
    const rawData = fs.readFileSync(influencersFilePath);
    const influencers = JSON.parse(rawData);
    
    // Filter influencers by industry
    let filteredInfluencers = influencers.filter(influencer => {
      // Case-insensitive comparison
      return influencer.industry.toLowerCase() === industry.toLowerCase();
    });
    
    // Filter by top status if topOnly is true
    if (topOnly) {
      filteredInfluencers = filteredInfluencers.filter(inf => inf.status === "Top");
    }
    
    // If no exact industry match found, try to find related influencers
    if (filteredInfluencers.length === 0) {
      // Get influencers with highest engagement rates regardless of industry
      filteredInfluencers = influencers
        .sort((a, b) => {
          // Parse engagement rate as numbers for comparison
          const rateA = parseFloat(a.engagementRate) || 0;
          const rateB = parseFloat(b.engagementRate) || 0;
          return rateB - rateA;
        })
        .slice(0, limit);
    }
    
    // Return limited number of influencers
    return filteredInfluencers.slice(0, limit).map(inf => ({
      name: inf.name,
      handle: inf.handle,
      platform: inf.platform,
      followers: inf.estimatedFollowers,
      engagementRate: inf.engagementRate
    }));
  } catch (error) {
    console.error('Error reading influencers data:', error);
    return [];
  }
};

module.exports = {
  getInfluencersByIndustry
};