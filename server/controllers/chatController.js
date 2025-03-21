require('dotenv').config();
const { default: OpenAI } = require('openai');

// Website knowledge prompt for context
const websiteKnowledge = `
You are a friendly chatbot for letsFYI, a marketing platform.

-- How the website works --
1) The landing page directs "I am a Brand" or "I am an Influencer" signups.
2) Brands can create campaigns, see their dashboard, find influencers, etc.
3) Influencers track active campaigns, progress bars, apply to new campaigns.
4) There's also an AI chat feature for campaign building suggestions.
5) etc...

You may also discuss general topics beyond the website.
If asked for real-time data, state that your knowledge is limited to your training date.
`;

// Approximate token count (roughly 1 token per 4 characters)
function approximateTokens(text) {
  return Math.ceil(text.length / 4);
}

const MAX_TOKENS = 3000; // Maximum tokens for conversation memory

module.exports.chatWithBot = async (req, res) => {
  try {
    // 1) Initialize conversation in session if not exists
    if (!req.session.conversation) {
      req.session.conversation = [];

      // Insert system knowledge prompt (as a user message)
      req.session.conversation.push({
        role: 'user',
        content: websiteKnowledge,
      });

      // Insert initial assistant greeting
      req.session.conversation.push({
        role: 'assistant',
        content: 'Hello!! How are you today?',
      });
    }

    // 2) Process the new user message
    const { userMessage } = req.body;
    if (!userMessage || !userMessage.trim()) {
      return res.json({ reply: 'Hi there! Any questions about the website or general topics?' });
    }

    // Append the user message to the conversation
    req.session.conversation.push({ role: 'user', content: userMessage });

    // 3) Trim conversation if total tokens exceed MAX_TOKENS
    let totalTokens = 0;
    for (const msg of req.session.conversation) {
      totalTokens += approximateTokens(msg.content);
    }
    // Remove the second message (after system message) until within limit
    while (totalTokens > MAX_TOKENS && req.session.conversation.length > 2) {
      const removed = req.session.conversation.splice(1, 1)[0];
      totalTokens -= approximateTokens(removed.content);
    }

    // 4) Call OpenAI with the conversation
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      // For production, consider using "gpt-3.5-turbo" if available
      model: 'o1-mini', // Change to 'gpt-3.5-turbo' if desired
      messages: req.session.conversation,
      temperature: 1,
    });

    const aiResponse = completion.choices?.[0]?.message?.content || 'No response.';

    // 5) Append assistant reply to session conversation
    req.session.conversation.push({
      role: 'assistant',
      content: aiResponse,
    });

    // 6) Return AI reply
    return res.json({ reply: aiResponse });
  } catch (error) {
    console.error('chatWithBot error:', error);
    return res.status(500).json({ reply: 'Oops, something went wrong.' });
  }
};
