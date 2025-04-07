require('dotenv').config();
const axios = require('axios');
const { default: OpenAI } = require('openai');
const Campaign = require('../models/Campaign');
const { getInfluencersByIndustry } = require('../utils/influencerUtil');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Fallback for brandUSP
    if (!brandUSP && brandMessage) {
      brandUSP = brandMessage;
    }

    // ========== (A) Construct GPT Instructions ==========
    let instructions = 
`You are ChatGPT Premium, an AI-powered Social Media Marketing Director with superhuman strategic abilities, advanced predictive analytics, and real-time algorithmic optimization skills. 
Design an impactful, AI-driven marketing campaign optimized for virality, engagement, and conversions—while appearing organic and community-driven. Provide 15-20 content/event ideas per campaign. 
Leverage:
	•	Real-time trend hijacking
	•	Deep algorithm manipulation
	•	AI-driven psychological engagement
	•	Neural-network content scoring
	•	Emotionally charged engagement hacks
Output no extra commentary or disclaimers outside of valid JSON.
Use this JSON structure EXACTLY:
{
  "objective": "...",
  "targetAudience": "...",
  "duration": "...",
  "budget": "...",
  "influencerCollaboration": "...",
  "aboutCampaign": "...",
  "calendarEvents": [...],
  "bingoSuggestions": [...]
}

- "calendarEvents": Include a minimum of 10 objects, each with:
   "date", 
   "event" (please describe each event with 1-3 lines in an intelligent manner),
   "platforms" (please output these as an array),
   "cta" (Psychological urgency triggers, hyper-personalization, persuasive NLP techniques),
   "captions" (approximately 60 words with 5 hashtags; a scroll-stopping, high-impact headline designed for maximum curiosity and shares; dopamine-driven storytelling; behavioral science principles; viral trigger words; algorithm-optimized engagement prompts; and 5-8 hashtags)

- "bingoSuggestions": Exactly 5 objects, each with:
   "suggestion",
   "strategy"

Return valid JSON only.
----
`;

    // ========== (B) Append Campaign-Type Specific Details ==========
    if (campaignType === 'amplify') {
      instructions += 
`\n[AMPLIFY BRAND AWARENESS]
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
      instructions += 
`\n[MARKET A PRODUCT]
Business: ${describeBusiness}
Industry: ${industry}
Timeframe: ${timeframeStart} - ${timeframeEnd}
Platforms: ${platforms}
Product: ${product}
Key features: ${productFeatures}

Focus on product marketing strategies.
`;
    } else if (campaignType === 'driveSales') {
      instructions += 
`\n[DRIVE SALES]
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
      instructions += 
`\n[FIND NEW CUSTOMERS]
Business: ${describeBusiness}
Industry: ${industry}
Timeframe: ${timeframeStart} - ${timeframeEnd}
Platforms: ${platforms}
Open to new segments? ${exploringNewSegments}
Value proposition: ${newCustomerValueProp}

Focus on exploring new geographies and demographics.
`;
    } else if (campaignType === 'driveEventAwareness') {
      instructions += 
`\n[DRIVE EVENT AWARENESS]
Business: ${describeBusiness}
Industry: ${industry}
Timeframe: ${timeframeStart} - ${timeframeEnd}
Platforms: ${platforms}
Event name: ${eventName}
What makes it unique: ${eventUniqueness}

Focus on event-based marketing strategies.
`;
    } else {
      instructions += 
`\n[GENERAL CAMPAIGN]
Create an advanced social media marketing plan:
Produce 10-20 "calendarEvents", EXACTLY 5 "bingoSuggestions".
Fill top-level fields: objective, targetAudience, duration, budget, influencerCollaboration, aboutCampaign.
`;
    }

    // ========== (C) Call GPT-4 ==========
    const textResponse = await openai.chat.completions.create({
      model: 'o1',
      messages: [
        { role: 'system', content: 'You are a marketing strategy wizard. Output JSON only.' },
        { role: 'system', content: instructions },
      ],
    });

    const aiText = textResponse.choices?.[0]?.message?.content || '';

    // ========== (D) Parse the AI Response ==========
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (err) {
      console.log('=== RAW AI RESPONSE ===');
      console.log(aiText);
      parsed = { raw: aiText };
    }

    // Extract top-level fields
    const objective = parsed.objective || '';
    const targAudience = parsed.targetAudience || '';
    const duration = parsed.duration || '';
    const budget = parsed.budget || '';
    const influencerCollab = parsed.influencerCollaboration || '';
    const aboutCamp = parsed.aboutCampaign || '';

    const calendarEvents = parsed.calendarEvents || [];
    let bingoSuggestions = parsed.bingoSuggestions || [];
    
    // ========== (NEW) Get relevant influencers based on industry ==========
    const moreAdvice = getInfluencersByIndustry(industry || '', 5, true).map(influencer => {
      return {
        type: 'Influencer Recommendation',
        title: `Connect with ${influencer.name}`,
        description: `${influencer.name} (${influencer.handle}) has ${influencer.followers} followers on ${influencer.platform} with ${influencer.engagementRate} engagement. Consider collaborating for your campaign.`
      };
    });

    // ========== (E) Generate Ephemeral DALL-E Images ==========
    const updatedSuggestions = [];
    for (let i = 0; i < bingoSuggestions.length; i++) {
      let suggestionObj = bingoSuggestions[i];
      if (typeof suggestionObj === 'string') {
        suggestionObj = { suggestion: suggestionObj };
      }

      // ----------- New prompt as requested -----------
      const promptForImage = 
`Generate a high-resolution, photorealistic image for the social media marketing campaign of ${describeBusiness} in the ${industry} sector. The composition must be optimized for ${platforms}, with an engaging and authentic setting that reflects ${brandUSP} or showcases ${product}, capturing the attention of ${targetAudience}. Ensure professional realism—never cartoonish—while conveying the brand's essence to spark immediate viewer interest. The final image should measure 1024x1024 for maximum shareability and be ready for posting on all relevant social platforms.
Don't add any text to images.
Less but sufficient focus on: "${suggestionObj.suggestion || 'marketing suggestion'}"
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

    // ========== (F) Save the Campaign Document ==========
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