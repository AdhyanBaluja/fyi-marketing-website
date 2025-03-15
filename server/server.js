// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

// Controllers
const { handleStripeWebhook } = require('./controllers/paymentController');

// Routes
const authRoutes = require('./routes/authRoutes');
const brandRoutes = require('./routes/brandRoutes');
const influencerRoutes = require('./routes/influencerRoutes');
const campaignRoutes = require('./routes/CampaignRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 1) Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// 2) Enable CORS
app.use(cors());

// 3) Stripe Webhook Route BEFORE express.json()
//    We must read the raw body for signature verification.
app.post(
  '/api/payment/stripe-webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// 4) Now parse JSON for all other routes
app.use(express.json());

// 5) Configure session
app.use(session({
  secret: process.env.SESSION_SECRET || 'someSuperSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    // secure: true,  // if using HTTPS in production
    // sameSite: 'none', // if cross-site
  }
}));

// 6) Serve local "uploads" folder
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// 7) Basic test route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// 8) Mount routes
// Auth => /api/auth
app.use('/api/auth', authRoutes);

// Brand => /api/brand
app.use('/api/brand', brandRoutes);

// Influencer => /api/influencer
app.use('/api/influencer', influencerRoutes);

// Campaign => /api/campaigns
app.use('/api/campaigns', campaignRoutes);

// AI => /api/ai
app.use('/api/ai', aiRoutes);

// Chat => /api/chat
app.use('/api/chat', chatRoutes);

// Payment => /api/payment
app.use('/api/payment', paymentRoutes);

// Users => /api/users
app.use('/api/users', userRoutes);

// 9) Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
