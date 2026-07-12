const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Profile = require('../models/Profile');

/**
 * @desc    Submit a review for a completed booking
 * @route   POST /api/reviews
 * @access  Private (Client role)
 */
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Verify requesting user is the client of the booking
    if (booking.clientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to review this booking' });
    }

    // Verify booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, error: 'Reviews can only be submitted for completed bookings' });
    }

    // Check if review already exists
    const reviewExists = await Review.findOne({ bookingId });
    if (reviewExists) {
      return res.status(400).json({ success: false, error: 'You have already submitted a review for this booking' });
    }

    // Create review
    const review = await Review.create({
      bookingId,
      clientId: req.user.id,
      assistantId: booking.assistantId,
      rating: Number(rating),
      comment: comment || '',
    });

    // Recalculate average rating using Bayesian Average Formula
    const reviews = await Review.find({ assistantId: booking.assistantId });
    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const R = totalReviews > 0 ? (sumRatings / totalReviews) : 0;
    
    // Platform stats (C = platform mean rating, m = min review threshold)
    const allReviews = await Review.find({});
    const platformTotal = allReviews.length;
    const platformSum = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const C = platformTotal > 0 ? (platformSum / platformTotal) : 4.5;
    const m = 2;

    const bayesianAverage = totalReviews > 0 
      ? parseFloat(((totalReviews * R + m * C) / (totalReviews + m)).toFixed(2))
      : parseFloat(C.toFixed(2));

    // Update Profile
    await Profile.findOneAndUpdate(
      { userId: booking.assistantId },
      { averageRating: bayesianAverage, totalReviews }
    );

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific assistant profile
 * @route   GET /api/reviews/assistant/:assistantId
 * @access  Public
 */
exports.getAssistantReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ assistantId: req.params.assistantId })
      .populate('clientId', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
