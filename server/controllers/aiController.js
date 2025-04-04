require('dotenv').config();
const axios = require('axios');
const { default: OpenAI } = require('openai');
const path = require('path');
const { google } = require('googleapis');
const Campaign = require('../models/Campaign');

// Create an OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =========== GOOGLE SHEETS HELPER - IMPROVED =========== //
async function fetchInfluencersFromGoogleSheet() {
  try {
    const sheetsAuth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../google-credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await sheetsAuth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1', // or your actual sheet name
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No influencer data found in sheet.');
      return [];
    }

    // First row => headers
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Convert each row to an object with normalized field names
    const influencerData = dataRows.map((row) => {
      const obj = {};
      headers.forEach((header, idx) => {
        // Store both original header and normalized version
        obj[header] = row[idx] || '';
        
        // Map fields to our standardized names
        if (header === 'Name' || header === 'name') obj.name = row[idx] || '';
        if (header === 'Handle/Username' || header === 'handle') obj.handle = row[idx] || '';
        if (header === 'Platform' || header === 'platform') obj.platform = row[idx] || '';
        if (header === 'Location' || header === 'location') obj.location = row[idx] || '';
        if (header === 'Estimated Followers' || header === 'followers') obj.followers = row[idx] || '';
        if (header === 'Engagement Rate' || header === 'engagementRate') obj.engagementRate = row[idx] || '';
      });
      return obj;
    });

    return influencerData;
  } catch (err) {
    console.error('Error reading from Google Sheet:', err);
    return [];
  }
}

exports.generateCampaignPlan = async (req, res) => {
  try {
    const { campaignType } = req.body;
    let {
      describeBusiness,
      industry,
      timeframeStart,
      timeframeEnd,
      platforms,
      marketTrends,
      targetAudience,
      brandUSP,
      product,
      productFeatures,
      salesProductOrService,
      promotionalOffers,
      salesLocation,
      exploringNewSegments,
      newCustomerValueProp,
      eventName,
      eventUniqueness,
      brandMessage,
    } = req.body;

    // brandUSP fallback
    if (!brandUSP && brandMessage) {
      brandUSP = brandMessage;
    }

    // ========== (A) Base Instructions ==========
    let instructions = `
You are ChatGPT Premium, an AI-powered Social Media Marketing Director with superhuman strategic abilities, advanced predictive analytics, and real-time algorithmic optimization skills.
Design an AI-driven marketing campaign for maximum virality, engagement, and conversions—while appearing organic and community-driven.
Provide 10-15 content/event ideas and use the EXACT JSON structure:

{
  "objective": "...",
  "targetAudience": "...",
  "duration": "...",
  "budget": "...",
  "influencerCollaboration": "...",
  "aboutCampaign": "...",
  "calendarEvents": [...],
  "bingoSuggestions": [...],
  "moreAdvice": [...]
}

- "calendarEvents": (min 10 objects) each has:
   "date",
   "event", (1-2 lines)
   "platforms" (array),
   "cta",
   "captions" (2-3 lines compulsory)

- "bingoSuggestions": exactly 5 objects, each with:
   "suggestion",
   "strategy"

- "moreAdvice":
   Must be an array of objects using the provided influencer data.

Return VALID JSON only, no extra text or disclaimers.
----

`;

    // ========== (B) Campaign-Specific Details ==========
    if (campaignType === 'amplify') {
      instructions += `
[AMPLIFY BRAND AWARENESS]
Business: ${describeBusiness}
Industry: ${industry}
Timeframe: ${timeframeStart} - ${timeframeEnd}
Platforms: ${platforms}
Market trends: ${marketTrends}
Target audience: ${targetAudience}
Brand USP: ${brandUSP}
Focus on boosting brand awareness.
`;
    } else if (campaignType === 'marketProduct') {
      instructions += `
[MARKET A PRODUCT]
Business: ${describeBusiness}
Industry: ${industry}
Timeframe: ${timeframeStart} - ${timeframeEnd}
Platforms: ${platforms}
Product: ${product}
Key features: ${productFeatures}
Focus on product marketing strategies.
`;
    } else if (campaignType === 'driveSales') {
      instructions += `
[DRIVE SALES]
Business: ${describeBusiness}
Industry: ${industry}
Timeframe: ${timeframeStart} - ${timeframeEnd}
Platforms: ${platforms}
Product/Service: ${salesProductOrService}
Promotional offers: ${promotionalOffers}
Target location(s): ${salesLocation}
Focus on sales promotions and conversion strategies.
`;
    } else if (campaignType === 'findNewCustomers') {
      instructions += `
[FIND NEW CUSTOMERS]
Business: ${describeBusiness}
Industry: ${industry}
Timeframe: ${timeframeStart} - ${timeframeEnd}
Platforms: ${platforms}
Open to new segments? ${exploringNewSegments}
Value proposition: ${newCustomerValueProp}
Focus on exploring new geographies and demographics.
`;
    } else if (campaignType === 'driveEventAwareness') {
      instructions += `
[DRIVE EVENT AWARENESS]
Business: ${describeBusiness}
Industry: ${industry}
Timeframe: ${timeframeStart} - ${timeframeEnd}
Platforms: ${platforms}
Event name: ${eventName}
What makes it unique: ${eventUniqueness}
Focus on event-based marketing strategies.
`;
    } else {
      instructions += `
[GENERAL CAMPAIGN]
Create an advanced social media marketing plan:
10-20 "calendarEvents", EXACTLY 5 "bingoSuggestions", 3+ "moreAdvice".
Fill top-level fields: objective, targetAudience, duration, budget, influencerCollaboration, aboutCampaign.
`;
    }

    // ========== (C) FETCH SHEET INFLUENCERS & add to instructions ==========
    const influencerData = await fetchInfluencersFromGoogleSheet();
    let influencerDataText = 'No influencer data found.';
    
    if (influencerData.length > 0) {
      console.log("Fetched influencer data:", JSON.stringify(influencerData, null, 2));
      
      // Format influencer data with consistent field names
      influencerDataText = influencerData
        .map((inf, idx) => {
          return `{
  "name": "${inf.name || `Influencer #${idx+1}`}",
  "handle": "${inf.handle || '@unknown'}",
  "platform": "${inf.platform || 'N/A'}",
  "location": "${inf.location || 'N/A'}",
  "followers": "${inf.followers || 'N/A'}",
  "engagementRate": "${inf.engagementRate || 'N/A'}"
}`;
        })
        .join(',\n');
    }

    instructions += `
We have this influencer data (JSON array). You MUST use these EXACT influencers in "moreAdvice" with their exact details plus your recommendedCollab:

[
${influencerDataText}
]

CRITICAL: When you fill "moreAdvice", copy each influencer object EXACTLY as provided above, then ADD the recommendedCollab field to each object:
{
  "name": "COPY EXACT name from above",
  "handle": "COPY EXACT handle from above",
  "platform": "COPY EXACT platform from above",
  "location": "COPY EXACT location from above", 
  "followers": "COPY EXACT followers from above",
  "engagementRate": "COPY EXACT engagementRate from above",
  "recommendedCollab": "Your recommendation for collaboration with this specific influencer"
}

DO NOT return generic placeholders like "Unknown" or "Influencer #1". Use the ACTUAL DATA I've provided above.
`;

    // ========== (D) GPT COMPLETION ==========
    const textResponse = await openai.chat.completions.create({
      model: 'o1',
      messages: [
        { 
          role: 'system', 
          content: 'You are a marketing strategy wizard. Output VALID JSON only. Ensure moreAdvice contains objects, not strings.' 
        },
        { role: 'system', content: instructions },
      ],
    });

    const aiText = textResponse.choices?.[0]?.message?.content || '';

    // ========== (E) PARSE RESPONSE ==========
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (err) {
      console.log('=== RAW AI RESPONSE ===');
      console.log(aiText);
      parsed = { raw: aiText };
    }

    // top-level fields
    const objective = parsed.objective || '';
    const targAudience = parsed.targetAudience || '';
    const duration = parsed.duration || '';
    const budget = parsed.budget || '';
    const influencerCollab = parsed.influencerCollaboration || '';
    const aboutCamp = parsed.aboutCampaign || '';
    const calendarEvents = parsed.calendarEvents || [];
    let bingoSuggestions = parsed.bingoSuggestions || [];
    
    // Process moreAdvice to ensure they're objects
    const moreAdvice = Array.isArray(parsed.moreAdvice) 
      ? parsed.moreAdvice.map(advice => {
          // If it's a string, try to convert it to an object
          if (typeof advice === 'string') {
            try {
              // Try to parse if it looks like JSON
              if (advice.trim().startsWith('{')) {
                return JSON.parse(advice);
              }
              
              // Otherwise create an object with the string as recommendedCollab
              return {
                name: "Unknown",
                handle: "Unknown",
                platform: "Unknown",
                location: "Unknown",
                followers: "Unknown",
                engagementRate: "Unknown",
                recommendedCollab: advice
              };
            } catch (e) {
              // Fallback object if parsing fails
              return {
                name: "Unknown",
                handle: "Unknown",
                platform: "Unknown",
                location: "Unknown",
                followers: "Unknown",
                engagementRate: "Unknown",
                recommendedCollab: advice
              };
            }
          }
          return advice; // Already an object
        })
      : [];

    // ========== (F) OPTIONAL: DALL-E on Bingo Suggestions ==========
    const updatedSuggestions = [];
    for (let i = 0; i < bingoSuggestions.length; i++) {
      let suggestionObj = bingoSuggestions[i];
      if (typeof suggestionObj === 'string') {
        suggestionObj = { suggestion: suggestionObj };
      }

      const promptForImage = `
"Generate a high-resolution, photorealistic image for the social media marketing campaign of ${describeBusiness} in the ${industry} sector. The composition must be optimized for ${platforms}, with an engaging and authentic setting that reflects ${brandUSP} or showcases ${product}, capturing the attention of ${targetAudience}. Ensure professional realism—never cartoonish—while conveying the brand's essence to spark immediate viewer interest. The final image should measure 1024x1024 for maximum shareability and be ready for posting on all relevant social platforms."
dont add any text to images
less but sufficient Focus on: "${suggestionObj.suggestion || 'marketing suggestion'}"
      `;

      try {
        const imageRes = await openai.images.generate({
          model: 'dall-e-3',
          prompt: promptForImage,
          n: 1,
          size: '1024x1024',
        });
        const ephemeralUrl = imageRes.data[0]?.url || null;
        suggestionObj.imageUrl = ephemeralUrl || '';
      } catch (imgErr) {
        console.error('Image generation failed for:', suggestionObj.suggestion, imgErr);
        suggestionObj.imageUrl = '';
      }

      updatedSuggestions.push(suggestionObj);
    }
    bingoSuggestions = updatedSuggestions;

    // ========== (G) SAVE CAMPAIGN ==========
    let nameFromType = campaignType || 'Custom';
    nameFromType = nameFromType.replace(/([A-Z])/g, ' $1').trim();

    const campaignDoc = await Campaign.create({
      userId: req.user.userId,
      name: `${nameFromType} Plan (AI)`,
      campaignType: campaignType || 'custom',
      objective,
      targetAudience: targAudience,
      duration,
      budget,
      influencerCollaboration: influencerCollab,
      aboutCampaign: aboutCamp,
      formInputs: {
        businessDescription: describeBusiness || '',
        industry: industry || '',
        timeframeStart: timeframeStart || '',
        timeframeEnd: timeframeEnd || '',
        platforms: platforms || '',
        marketTrends: marketTrends || '',
        targetAudience: targetAudience || '',
        brandUSP: brandUSP || '',
        product: product || '',
        productFeatures: productFeatures || '',
        salesProductOrService: salesProductOrService || '',
        promotionalOffers: promotionalOffers || '',
        salesLocation: salesLocation || '',
        exploringNewSegments: exploringNewSegments || '',
        newCustomerValueProp: newCustomerValueProp || '',
        eventName: eventName || '',
        eventUniqueness: eventUniqueness || '',
      },
      aiResponse: aiText,
      calendarEvents,
      bingoSuggestions,
      moreAdvice,
    });

    return res.status(201).json({
      message: 'Campaign plan generated (ephemeral DALL·E links)!',
      campaign: campaignDoc,
    });
  } catch (error) {
    console.error('Error generating campaign plan with OpenAI:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};