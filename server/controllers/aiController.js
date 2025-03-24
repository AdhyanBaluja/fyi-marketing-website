require('dotenv').config();
const axios = require('axios');
const { default: OpenAI } = require('openai');
const Campaign = require('../models/Campaign');

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
    let instructions = `
You are ChatGPT Premium, an AI-powered Social Media Marketing Director with superhuman strategic abilities, advanced predictive analytics, and real-time algorithmic optimization skills. 
Design impactful, AI-driven marketing campaign optimized for virality, engagement, and conversions—while appearing organic and community-driven. Provide 15-20 content/event ideas per compaign. 
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
  "bingoSuggestions": [...],
  "moreAdvice": [...]
}

- "calendarEvents": Include minimum 10 objects, each with:
   "date" , 
   "event" (please describle each event with 1-3 lines in an intelligent manner),
   "platforms" (please output these as an array) ,
   "cta"(Psychological urgency triggers, Hyper-personalization, Persuasive NLP techniques),
   "captions"(60 words approx with 5 hashtags ,A scroll-stopping, high-impact headline designed for maximum curiosity and shares, Dopamine-driven storytelling ,Behavioral science principles, Viral trigger words, Algorithm-optimized engagement prompts, 5-8 hashtags

- "bingoSuggestions": Exactly 5 objects, each with:
   "suggestion",
   "strategy"

- "moreAdvice": Provide at least 5 advanced tips for boosting brand consistency across social media.
                Focus on psychological engagement, algorithmic optimization, and viral triggers in each tip.
                Add information about gamification points, color palette and Brand Visual Guidelines,Restrictions/Compliance, Seasonal or Event Hooks

Return valid JSON only.
----
`;

    // ========== (B) Append Campaign-Type Specific Details ==========
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
Produce 10-20 "calendarEvents", EXACTLY 5 "bingoSuggestions", and 3+ "moreAdvice".
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
    const moreAdvice = parsed.moreAdvice || [];

    // ========== (E) Generate Ephemeral DALL-E Images ==========
    const updatedSuggestions = [];
    for (let i = 0; i < bingoSuggestions.length; i++) {
      let suggestionObj = bingoSuggestions[i];
      if (typeof suggestionObj === 'string') {
        suggestionObj = { suggestion: suggestionObj };
      }

      const promptForImage = `
A high-quality, creative illustration related to the business description for: "${suggestionObj.suggestion || 'marketing suggestion'}"
Style: Crisp, modern. DALL-E 3, 1024x1024.
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
