const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  try {
    // Expecting header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Extract token after "Bearer"

    // Verify the token using the secret from the environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// Require the brand role for protected routes
exports.requireBrand = (req, res, next) => {
  if (req.user.role !== 'brand') {
    return res.status(403).json({ error: 'Requires brand role' });
  }
  next();
};

// Require the influencer role for protected routes
exports.requireInfluencer = (req, res, next) => {
  if (req.user.role !== 'influencer') {
    return res.status(403).json({ error: 'Requires influencer role' });
  }
  next();
};
