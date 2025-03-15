// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  try {
    // Typically: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer" <token>

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional: require brand role
exports.requireBrand = (req, res, next) => {
  if (req.user.role !== 'brand') {
    return res.status(403).json({ error: 'Requires brand role' });
  }
  next();
};

// Optional: require influencer role
exports.requireInfluencer = (req, res, next) => {
  if (req.user.role !== 'influencer') {
    return res.status(403).json({ error: 'Requires influencer role' });
  }
  next();
};
