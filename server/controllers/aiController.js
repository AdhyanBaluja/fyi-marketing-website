// controllers/aiController.js

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

    // If brandUSP is empty, fallback to brandMessage
    if (!brandUSP && brandMessage) {
      brandUSP = brandMessage;
    }

    // ========== (A) GPT instructions
    let instructions = `
You are ChatGPT, a top-tier marketing consultant using GPT-4.
You MUST produce a thoroughly reasoned, multi-week plan in strict JSON. 
We want no disclaimers or extraneous text outside JSON.

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

- "calendarEvents": 10 to 20 objects, each with:
   "date",
   "event" //event should be well descriptive with 4-5 lines minimum,
   "platforms",
   "cta" ,
   "captions" //captions should be 1-2 lines and then hashtags,

- "bingoSuggestions": EXACTLY 5 objects, each with:
   "suggestion",
   "strategy"

- "moreAdvice": at least 3 hooks and advice

Return valid JSON only. If you add commentary or disclaimers, wrap them inside the JSON as "note" or so we can still parse.
----
`;

    // (B) Specialized chunk per campaignType
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

Focus on brand awareness.
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

Focus on daily/weekly promotions, discount codes, etc.
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

Focus on new geographies/demographics.
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
[NO RECOGNIZED CAMPAIGN TYPE]
Use your best judgement for a general marketing plan:
Produce 10–20 "calendarEvents", EXACTLY 5 "bingoSuggestions", 3+ "moreAdvice".
Also fill the top-level fields: objective, targetAudience, duration, budget, influencerCollaboration, aboutCampaign.
`;
    }

    // ========== (C) GPT-4 Chat
    const textResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a marketing strategy wizard. Output JSON only.' },
        { role: 'user', content: instructions },
      ],
      temperature: 0.7,
      max_tokens: 7000,
    });

    const aiText = textResponse.choices?.[0]?.message?.content || '';

    // ========== (D) parse JSON
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (err) {
      console.log('=== RAW AI RESPONSE ===');
      console.log(aiText);
      parsed = { raw: aiText };
    }

    // If the JSON includes top-level fields, we store them.
    const objective = parsed.objective || '';
    const targAudience = parsed.targetAudience || '';
    const duration = parsed.duration || '';
    const budget = parsed.budget || '';
    const influencerCollab = parsed.influencerCollaboration || '';
    const aboutCamp = parsed.aboutCampaign || '';

    const calendarEvents = parsed.calendarEvents || [];
    let bingoSuggestions = parsed.bingoSuggestions || [];
    const moreAdvice = parsed.moreAdvice || [];

    // ========== (E) Generate ephemeral DALL-E images => store ephemeral links
    const updatedSuggestions = [];
    for (let i = 0; i < bingoSuggestions.length; i++) {
      let suggestionObj = bingoSuggestions[i];
      if (typeof suggestionObj === 'string') {
        suggestionObj = { suggestion: suggestionObj };
      }

      const promptForImage = `
A high-quality, creative illustration for: "${suggestionObj.suggestion || 'marketing suggestion'}"
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

    // ========== (F) Save to Mongo
    // (F.1) Build a name from the type
    let nameFromType = campaignType || 'Custom';
    nameFromType = nameFromType.replace(/([A-Z])/g, ' $1').trim();

    // (F.2) CREATE the campaign doc and store the user inputs in formInputs
    const campaignDoc = await Campaign.create({
      userId: req.user.userId,
      name: `${nameFromType} Plan (AI)`,
      campaignType: campaignType || 'custom',

      // top-level fields from GPT
      objective,
      targetAudience: targAudience,
      duration,
      budget,
      influencerCollaboration: influencerCollab,
      aboutCampaign: aboutCamp,

      // store user-provided fields in formInputs so the front end can display them
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
