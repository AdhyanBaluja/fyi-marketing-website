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

// 2) Configure CORS to allow requests from https://letsfyi.com
app.use(cors({
  origin: 'https://letsfyi.com',   // or an array if you have multiple domains
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// 3) Stripe Webhook Route (must be defined before express.json())
//    This route uses express.raw to capture the raw body for signature verification.
app.post(
  '/api/payment/stripe-webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// 4) Parse JSON for all other routes
app.use(express.json());

// 5) Configure sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'someSuperSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    // secure: true,   // Uncomment in production if using HTTPS
    // sameSite: 'none'
  }
}));

// 6) Serve static files from the "uploads" folder
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// 7) Basic test route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// 8) Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/influencer', influencerRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);

// 9) Start the server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 10) Increase server timeout to handle very long requests (e.g. large AI calls).
//     The value here is in milliseconds. Example: 600000 => 10 minutes.
server.setTimeout(600000);  // 10 minutes
