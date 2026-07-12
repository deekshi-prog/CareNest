const Profile = require('../models/Profile');
const User = require('../models/User');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

// Helper to mask phone and address until a booking is active
const maskContactInfo = async (profileData, loggedInUser) => {
  const userIdStr = profileData.userId?._id ? profileData.userId._id.toString() : profileData.userId?.toString();
  
  if (!loggedInUser) {
    return {
      ...profileData,
      phone: profileData.phone ? profileData.phone.replace(/\d(?=\d{4})/g, 'X') : 'N/A',
      address: profileData.address ? `${profileData.address.split(',')[0]} (Exact details hidden)` : 'N/A',
    };
  }

  if (loggedInUser.role === 'admin' || userIdStr === loggedInUser.id) {
    return profileData;
  }

  const activeBooking = await Booking.findOne({
    clientId: loggedInUser.id,
    assistantId: userIdStr,
    status: { $in: ['confirmed', 'in_progress', 'completed'] }
  });

  if (activeBooking) {
    return profileData;
  }

  return {
    ...profileData,
    phone: profileData.phone ? profileData.phone.replace(/\d(?=\d{4})/g, 'X') : 'N/A',
    address: profileData.address ? `${profileData.address.split(',')[0]} (Exact details hidden)` : 'N/A',
  };
};

/**
 * @desc    Search verified assistants using location and filters
 * @route   GET /api/assistants
 * @access  Public
 */
exports.searchAssistants = async (req, res, next) => {
  try {
    const {
      latitude,
      longitude,
      maxDistance = 10, // Default 10km radius
      services,
      minRating,
      maxPrice,
    } = req.query;

    const query = {
      isVerified: true,
    };

    // Services Filter
    if (services) {
      const servicesArray = Array.isArray(services) 
        ? services 
        : services.split(',').map(s => s.trim());
      
      if (servicesArray.length > 0) {
        query.services = { $in: servicesArray };
      }
    }

    // Minimum Rating Filter
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Maximum Hourly Rate Filter
    if (maxPrice) {
      query.hourlyRate = { $lte: parseFloat(maxPrice) };
    }

    let profiles = [];
    
    // Geolocation Query Setup with Dynamic Radius
    if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const maxDistanceKm = maxDistance ? parseFloat(maxDistance) : 5;

      query.location = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistanceKm * 1000,
        },
      };

      profiles = await Profile.find(query).populate('userId', 'name email avatar').lean();

      // Expand to 15km if no custom maxDistance was requested and no assistants found
      if (!maxDistance && profiles.length === 0) {
        query.location.$nearSphere.$maxDistance = 15000; // 15km
        profiles = await Profile.find(query).populate('userId', 'name email avatar').lean();
      }
    } else {
      profiles = await Profile.find(query).populate('userId', 'name email avatar').lean();
    }

    // Map profiles into cleaner frontend structures and apply masking
    const mappedAssistants = await Promise.all(
      profiles.map(async (p) => {
        let calculatedDistance = null;
        if (latitude && longitude && p.location && p.location.coordinates) {
          const r = 6371; // earth radius in km
          const lat1 = parseFloat(latitude) * (Math.PI / 180);
          const lat2 = p.location.coordinates[1] * (Math.PI / 180);
          const diffLat = (p.location.coordinates[1] - parseFloat(latitude)) * (Math.PI / 180);
          const diffLng = (p.location.coordinates[0] - parseFloat(longitude)) * (Math.PI / 180);

          const a = Math.sin(diffLat / 2) * Math.sin(diffLat / 2) +
                    Math.cos(lat1) * Math.cos(lat2) *
                    Math.sin(diffLng / 2) * Math.sin(diffLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          calculatedDistance = parseFloat((r * c).toFixed(2));
        }

        const rawData = {
          profileId: p._id,
          userId: p.userId?._id,
          name: p.userId?.name || 'Assistant',
          avatar: p.userId?.avatar || '',
          email: p.userId?.email || '',
          phone: p.phone,
          address: p.address,
          location: p.location,
          bio: p.bio,
          isVerified: p.isVerified,
          services: p.services,
          hourlyRate: p.hourlyRate,
          availability: p.availability,
          averageRating: p.averageRating,
          totalReviews: p.totalReviews,
          distance: calculatedDistance,
        };

        // Apply data masking (req.user is populated by protect, or optional auth)
        return await maskContactInfo(rawData, req.user);
      })
    );

    // If no distance sorting applies, we can sort by rating descending
    if (!latitude || !longitude) {
      mappedAssistants.sort((a, b) => b.averageRating - a.averageRating);
    }

    res.status(200).json({
      success: true,
      count: mappedAssistants.length,
      data: mappedAssistants,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed assistant profile by User ID (including reviews)
 * @route   GET /api/assistants/:userId
 * @access  Public
 */
exports.getAssistantById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('name email avatar role');
    if (!user || user.role !== 'assistant') {
      return res.status(404).json({ success: false, error: 'Assistant not found' });
    }

    const profile = await Profile.findOne({ userId: req.params.userId }).lean();
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Assistant profile not found' });
    }

    const maskedProfile = await maskContactInfo(profile, req.user);

    // Retrieve reviews for this assistant
    const reviews = await Review.find({ assistantId: req.params.userId })
      .populate('clientId', 'name avatar')
      .sort('-createdAt')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        profile: maskedProfile,
        reviews: reviews.map((r) => ({
          id: r._id,
          clientName: r.clientId?.name || 'Anonymous User',
          clientAvatar: r.clientId?.avatar || '',
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
