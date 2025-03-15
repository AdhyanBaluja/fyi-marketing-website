// controllers/chatController.js

require('dotenv').config();
const { default: OpenAI } = require('openai');

// We'll keep the website knowledge block intact:
const websiteKnowledge = `
You are a friendly chatbot for letsFYI, a marketing platform.

-- How the website works --
1) The landing page can direct "I am a Brand" or "I am an Influencer" signups.
2) Brands can create campaigns, see brand dashboard, find influencers, etc.
3) Influencers track active campaigns, progress bars, apply to new campaigns.
4) There's also an AI chat or suggestions for building campaigns.
5) etc...

But you may also speak about general topics outside this website. 
If asked for real-time or current data, disclaim that you have knowledge up to your training date, or provide your best guess.
`;

// A rough token approximation function
function approximateTokens(text) {
  // ~1 token per 4 chars
  return Math.ceil(text.length / 4);
}

const MAX_TOKENS = 3000; // memory limit

module.exports.chatWithBot = async (req, res) => {
  try {
    // 1) If no conversation yet in session, create it
    if (!req.session.conversation) {
      req.session.conversation = [];

      // Insert system message with *both* website knowledge + general ability
      req.session.conversation.push({
        role: 'user',
        content: websiteKnowledge
      });

      // Insert initial greeting as an assistant message
      req.session.conversation.push({
        role: 'assistant',
        content: 'Hello!! How are you today?'
      });
    }

    // 2) Check the user’s new message
    const { userMessage } = req.body;
    if (!userMessage || !userMessage.trim()) {
      return res.json({ reply: 'Hi there! Any questions about the website or general topics?' });
    }

    // 3) Append user message to conversation
    req.session.conversation.push({ role: 'user', content: userMessage });

    // 4) Check total tokens, remove older if needed
    let totalTokens = 0;
    for (const msg of req.session.conversation) {
      totalTokens += approximateTokens(msg.content);
    }
    while (totalTokens > MAX_TOKENS && req.session.conversation.length > 2) {
      const removed = req.session.conversation.splice(1, 1)[0];
      totalTokens -= approximateTokens(removed.content);
    }

    // 5) Call OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: 'o1-mini', // or "gpt-3.5-turbo"
      messages: req.session.conversation,
      temperature: 1
    });

    const aiResponse = completion.choices?.[0]?.message?.content || 'No response.';

    // 6) Append the assistant reply
    req.session.conversation.push({
      role: 'assistant',
      content: aiResponse
    });

    // 7) Return to front-end
    return res.json({ reply: aiResponse });
  } catch (error) {
    console.error('chatWithBot error:', error);
    return res.status(500).json({ reply: 'Oops, something went wrong.' });
  }
};
