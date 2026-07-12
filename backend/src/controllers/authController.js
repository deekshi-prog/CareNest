const User = require('../models/User');
const Profile = require('../models/Profile');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const { uploadToCloudinaryOrLocal } = require('../config/upload');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'floraassistdevelopmenttokensecretkey987654321', {
    expiresIn: '15m',
  });
};

const generateRefreshToken = async (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET || 'floraassistdevelopmenttokensecretkey987654321', {
    expiresIn: '7d',
  });
  
  await RefreshToken.create({
    token,
    userId: id,
  });

  return token;
};

const getRefreshTokenFromCookieOrHeader = (req) => {
  if (req.cookies && req.cookies.refreshToken) {
    return req.cookies.refreshToken;
  }
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, curr) => {
      const [key, val] = curr.trim().split('=');
      acc[key] = val;
      return acc;
    }, {});
    return cookies.refreshToken;
  }
  return null;
};

const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token: accessToken, // Frontend expects "token"
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

/**
 * @desc    Register a new user and create an empty profile
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'client',
    });

    // Create associated empty profile
    await Profile.create({
      userId: user._id,
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
    });

    // Generate JWT tokens
    await sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate JWT tokens
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user details & profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    // Find profile
    const profile = await Profile.findOne({ userId: req.user.id });

    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
      },
      profile: profile || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      phone,
      address,
      latitude,
      longitude,
      bio,
      services,
      hourlyRate,
      availability,
    } = req.body;

    // Build profile fields to update
    const profileFields = {
      phone: phone !== undefined ? phone : '',
      address: address !== undefined ? address : '',
      bio: bio !== undefined ? bio : '',
    };

    // Parse location coordinates if both latitude and longitude are supplied
    if (latitude !== undefined && longitude !== undefined) {
      profileFields.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)], // [longitude, latitude]
      };
    }

    // Role-specific field updates for assistants
    if (req.user.role === 'assistant') {
      if (services !== undefined) profileFields.services = Array.isArray(services) ? services : JSON.parse(services);
      if (hourlyRate !== undefined) profileFields.hourlyRate = Number(hourlyRate);
      if (availability !== undefined) profileFields.availability = Array.isArray(availability) ? availability : JSON.parse(availability);
    }

    // Update profile
    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      // Fallback: Create if somehow missing
      profileFields.userId = req.user.id;
      profile = await Profile.create(profileFields);
    } else {
      profile = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
    }

    // Update user display name and avatar if provided in req.body
    if (req.body.name) {
      req.user.name = req.body.name;
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      profile,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload avatar image
 * @route   POST /api/auth/avatar
 * @access  Private
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a photo file' });
    }

    // Upload to local or Cloudinary
    const imageUrl = await uploadToCloudinaryOrLocal(req, req.file);

    // Save to User
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: imageUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      avatar: imageUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token using refresh token cookie
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refresh = async (req, res, next) => {
  try {
    const token = getRefreshTokenFromCookieOrHeader(req);

    if (!token) {
      return res.status(401).json({ success: false, error: 'No refresh token provided' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'floraassistdevelopmenttokensecretkey987654321');
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }

    // Check whitelist
    const savedToken = await RefreshToken.findOne({ token });

    if (!savedToken) {
      // REUSE DETECTED! Token theft mitigation!
      // Delete all refresh tokens for this user immediately!
      await RefreshToken.deleteMany({ userId: decoded.id });
      res.clearCookie('refreshToken');
      return res.status(401).json({ success: false, error: 'Refresh token reuse detected. Revoking session.' });
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    // Rotate token: delete old
    await savedToken.deleteOne();

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user and clear refresh token
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    const token = getRefreshTokenFromCookieOrHeader(req);
    if (token) {
      await RefreshToken.deleteOne({ token });
    }
    
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
