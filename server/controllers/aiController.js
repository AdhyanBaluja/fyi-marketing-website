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
You are ChatGPT, an expert marketing consultant powered by GPT-4.
Your task is to create a comprehensive, multi-week marketing campaign plan in strict JSON format.
Output **only valid JSON** with no extra commentary or disclaimers.

Use the following JSON structure EXACTLY:
{
  "objective": "The main goal of the campaign.",
  "targetAudience": "A detailed description of the audience.",
  "duration": "Campaign duration (e.g., 6 weeks).",
  "budget": "Budget allocated for the campaign.",
  "influencerCollaboration": "Details about any influencer partnerships.",
  "aboutCampaign": "Overview of the campaign concept.",
  "calendarEvents": [
    {
      "date": "YYYY-MM-DD",
      "event": "Brief description of the event",
      "platforms": "Social media platforms to be used",
      "cta": "Call-to-action text",
      "captions": "One or two lines with hashtags"
    },
    // Include 10 to 20 such event objects.
  ],
  "bingoSuggestions": [
    {
      "suggestion": "Marketing idea or tactic",
      "strategy": "How to implement it"
    }
    // Exactly 5 objects.
  ],
  "moreAdvice": [
    "Additional advice point 1",
    "Additional advice point 2",
    "Additional advice point 3"
    // Include at least 3 advice strings.
  ]
}

Guidelines:
- Do not output any text outside of the JSON structure.
- Ensure all fields are filled with creative, actionable, and data-driven recommendations.
- Be thorough and detailed, ensuring the campaign plan is realistic and innovative.
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
Use your best judgement for a general marketing plan:
Produce 10–20 "calendarEvents", EXACTLY 5 "bingoSuggestions", and 3+ "moreAdvice".
Fill top-level fields: objective, targetAudience, duration, budget, influencerCollaboration, aboutCampaign.
`;
    }

    // ========== (C) Call GPT-4 ==========
    const textResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a marketing strategy wizard. Output JSON only.' },
        { role: 'user', content: instructions },
      ],
      temperature: 0.4,
      top_p: 1,
      max_tokens: 7000,
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
