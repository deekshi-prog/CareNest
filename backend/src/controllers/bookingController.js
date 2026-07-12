const Booking = require('../models/Booking');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { uploadToCloudinaryOrLocal } = require('../config/upload');
const { getBookingRequestTemplate, getBookingConfirmationTemplate } = require('../utils/mailer');
const { addJobToQueue } = require('../utils/jobQueue');
const { validateExifData } = require('../utils/exifValidator');

// Calculate spherical distance between two coordinates in meters
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

/**
 * @desc    Create a new booking request
 * @route   POST /api/bookings
 * @access  Private (Client role)
 */
exports.createBooking = async (req, res, next) => {
  try {
    const { assistantId, startDate, endDate, totalPrice, tasks } = req.body;
    const idempotencyKey = req.headers['x-idempotency-key'];

    // 1. Idempotency Check
    if (idempotencyKey) {
      const existingBooking = await Booking.findOne({ idempotencyKey });
      if (existingBooking) {
        return res.status(200).json({
          success: true,
          data: existingBooking,
          message: 'Retrieved duplicate booking request successfully via idempotency key.',
        });
      }
    }

    // Check if assistant exists and is indeed an assistant
    const assistant = await User.findById(assistantId);
    if (!assistant || assistant.role !== 'assistant') {
      return res.status(404).json({ success: false, error: 'Assistant user not found' });
    }

    // 2. Double-Booking Guard (Check for confirmed overlaps)
    const overlappingBooking = await Booking.findOne({
      assistantId,
      status: { $in: ['confirmed', 'in_progress'] },
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        error: 'Assistant is already booked for an overlapping time slot during these dates.',
      });
    }

    // Prepare checklist tasks format
    const formattedTasks = tasks.map((taskName) => ({
      taskName,
      isCompleted: false,
    }));

    // Create booking (status: pending by default)
    const booking = await Booking.create({
      clientId: req.user.id,
      assistantId,
      startDate,
      endDate,
      totalPrice,
      tasks: formattedTasks,
      idempotencyKey,
    });

    // Send email notification to assistant asynchronously via queue
    const formattedDates = `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
    await addJobToQueue('email', {
      email: assistant.email,
      subject: 'New Booking Request - CareNest',
      html: getBookingRequestTemplate(req.user.name, assistant.name, formattedDates),
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user bookings (both client and assistant)
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getBookings = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'client') {
      query.clientId = req.user.id;
    } else if (req.user.role === 'assistant') {
      query.assistantId = req.user.id;
    } else if (req.user.role === 'admin') {
      // Admins get everything
    }

    const bookings = await Booking.find(query)
      .populate('clientId', 'name email avatar')
      .populate('assistantId', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get booking details
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('clientId', 'name email avatar')
      .populate('assistantId', 'name email avatar');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Authorize check: Must be client, assistant, or admin associated
    if (
      booking.clientId._id.toString() !== req.user.id &&
      booking.assistantId._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm a booking request
 * @route   PUT /api/bookings/:id/confirm
 * @access  Private (Assistant role)
 */
exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('clientId', 'name email')
      .populate('assistantId', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Verify booking is for this assistant
    if (booking.assistantId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this booking' });
    }

    // Verify current status is pending
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Booking is not in pending state' });
    }

    booking.status = 'confirmed';
    await booking.save();

    // Notify client via queue
    const formattedDates = `${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}`;
    await addJobToQueue('email', {
      email: booking.clientId.email,
      subject: 'Booking Confirmed! - CareNest',
      html: getBookingConfirmationTemplate(booking.clientId.name, booking.assistantId.name, formattedDates, 'confirmed'),
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject / Cancel a booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('clientId', 'name email')
      .populate('assistantId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const isClient = booking.clientId._id.toString() === req.user.id;
    const isAssistant = booking.assistantId._id.toString() === req.user.id;

    if (!isClient && !isAssistant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this booking' });
    }

    // State validation
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Cannot cancel an already completed or cancelled booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Notify other party via queue
    const recipient = isClient ? booking.assistantId : booking.clientId;
    const senderName = isClient ? booking.clientId.name : booking.assistantId.name;
    const formattedDates = `${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}`;

    await addJobToQueue('email', {
      email: recipient.email,
      subject: 'Booking Cancelled - CareNest',
      html: getBookingConfirmationTemplate(recipient.name, senderName, formattedDates, 'cancelled'),
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start booking service execution
 * @route   PUT /api/bookings/:id/start
 * @access  Private (Assistant role)
 */
exports.startBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.assistantId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to access this booking' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, error: 'Booking must be confirmed before starting service' });
    }

    // Geofence check
    const { latitude, longitude, bypassGeofence } = req.body;
    if (!bypassGeofence) {
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ success: false, error: 'Location coordinates (latitude/longitude) are required to verify presence.' });
      }

      const clientProfile = await Profile.findOne({ userId: booking.clientId });
      if (clientProfile && clientProfile.location && clientProfile.location.coordinates) {
        const clientLng = clientProfile.location.coordinates[0];
        const clientLat = clientProfile.location.coordinates[1];
        
        // Skip check if client coordinates are placeholder [0, 0]
        if (clientLng !== 0 || clientLat !== 0) {
          const distance = getDistanceMeters(parseFloat(latitude), parseFloat(longitude), clientLat, clientLng);
          if (distance > 50) {
            return res.status(400).json({ 
              success: false, 
              error: `Geofence block: You are ${Math.round(distance)} meters away. You must be within 50m of the property to start work.` 
            });
          }
        }
      }
    }

    booking.status = 'in_progress';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task checklist completion status
 * @route   PUT /api/bookings/:id/tasks
 * @access  Private (Assistant role)
 */
exports.updateTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // Array of { taskId, isCompleted }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.assistantId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    if (booking.status !== 'in_progress') {
      return res.status(400).json({ success: false, error: 'Tasks can only be modified on active in-progress bookings' });
    }

    // Map through checklist and update matching items
    booking.tasks = booking.tasks.map((t) => {
      const match = tasks.find((item) => item.taskId === t._id.toString());
      if (match) {
        t.isCompleted = match.isCompleted;
      }
      return t;
    });

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload visit proof photo & notes
 * @route   POST /api/bookings/:id/proof
 * @access  Private (Assistant role)
 */
exports.uploadProof = async (req, res, next) => {
  try {
    const { comment } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.assistantId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    if (booking.status !== 'in_progress') {
      return res.status(400).json({ success: false, error: 'Proof uploads are only allowed during in-progress bookings' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload an image file as task completion proof' });
    }

    // Validate image EXIF metadata
    const clientProfile = await Profile.findOne({ userId: booking.clientId });
    if (clientProfile && clientProfile.location && clientProfile.location.coordinates) {
      const clientLng = clientProfile.location.coordinates[0];
      const clientLat = clientProfile.location.coordinates[1];
      
      if (clientLng !== 0 || clientLat !== 0) {
        const exifCheck = validateExifData(req.file.buffer, clientLat, clientLng);
        if (!exifCheck.success) {
          return res.status(400).json({ success: false, error: exifCheck.error || 'Tamper-proof EXIF validation failed.' });
        }
      }
    }

    // Upload to local or Cloudinary
    const imageUrl = await uploadToCloudinaryOrLocal(req, req.file);

    // Append to proof logs
    booking.visitProofUrl = imageUrl;
    booking.visitProofTimestamp = new Date();
    booking.visitProofs.push({
      imageUrl,
      comment: comment || '',
      timestamp: new Date(),
    });

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark booking service execution completed
 * @route   PUT /api/bookings/:id/complete
 * @access  Private (Assistant role)
 */
exports.completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.assistantId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    if (booking.status !== 'in_progress') {
      return res.status(400).json({ success: false, error: 'Booking is not in-progress' });
    }

    // Geofence check
    const { latitude, longitude, bypassGeofence } = req.body;
    if (!bypassGeofence) {
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ success: false, error: 'Location coordinates (latitude/longitude) are required to verify presence.' });
      }

      const clientProfile = await Profile.findOne({ userId: booking.clientId });
      if (clientProfile && clientProfile.location && clientProfile.location.coordinates) {
        const clientLng = clientProfile.location.coordinates[0];
        const clientLat = clientProfile.location.coordinates[1];
        
        // Skip check if client coordinates are placeholder [0, 0]
        if (clientLng !== 0 || clientLat !== 0) {
          const distance = getDistanceMeters(parseFloat(latitude), parseFloat(longitude), clientLat, clientLng);
          if (distance > 50) {
            return res.status(400).json({ 
              success: false, 
              error: `Geofence block: You are ${Math.round(distance)} meters away. You must be within 50m of the property to complete work.` 
            });
          }
        }
      }
    }

    booking.status = 'completed';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit booking for client review (Pending Confirmation)
 * @route   PUT /api/bookings/:id/submit-review
 * @access  Private (Assistant role)
 */
exports.submitForClientReview = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    if (booking.assistantId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    if (booking.status !== 'in_progress' && booking.status !== 'In Progress') {
      return res.status(400).json({ success: false, error: 'Booking must be in progress to submit proof' });
    }
    booking.status = 'Pending Confirmation';
    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm work & release payment (Completed)
 * @route   PUT /api/bookings/:id/client-confirm
 * @access  Private (Client role)
 */
exports.confirmBookingPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    if (booking.clientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    if (booking.status !== 'Pending Confirmation') {
      return res.status(400).json({ success: false, error: 'Booking is not pending client confirmation' });
    }
    booking.status = 'Completed';
    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Report dispute and operational issues (Disputed)
 * @route   PUT /api/bookings/:id/client-dispute
 * @access  Private (Client role)
 */
exports.disputeBooking = async (req, res, next) => {
  try {
    const { disputeFeedback } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    if (booking.clientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    if (booking.status !== 'Pending Confirmation') {
      return res.status(400).json({ success: false, error: 'Booking is not pending client confirmation' });
    }
    booking.status = 'Disputed';
    booking.disputeFeedback = disputeFeedback || 'No details provided.';
    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
