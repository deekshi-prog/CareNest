const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verify token
exports.protect = async (req, res, next) => {
  let token;

  // Check for Token in Authorization Header (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'floraassistdevelopmenttokensecretkey987654321');

    // Attach user to req.user (excluding password field)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User matching this token was not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Optional protect - parses token if exists, but does not block if it doesn't
exports.optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'floraassistdevelopmenttokensecretkey987654321');
      req.user = await User.findById(decoded.id);
    } catch (err) {
      // Ignore token errors and proceed as guest
    }
  }

  next();
};
