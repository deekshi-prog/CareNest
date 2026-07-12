const express = require('express');
const {
  createBooking,
  getBookings,
  getBooking,
  confirmBooking,
  cancelBooking,
  startBooking,
  updateTasks,
  uploadProof,
  completeBooking,
  submitForClientReview,
  confirmBookingPayment,
  disputeBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/upload');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/confirm', protect, authorize('assistant'), confirmBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/start', protect, authorize('assistant'), startBooking);
router.put('/:id/tasks', protect, authorize('assistant'), updateTasks);
router.post('/:id/proof', protect, authorize('assistant'), upload.single('proof'), uploadProof);
router.put('/:id/complete', protect, authorize('assistant'), completeBooking);
router.put('/:id/submit-review', protect, authorize('assistant'), submitForClientReview);
router.put('/:id/client-confirm', protect, authorize('client'), confirmBookingPayment);
router.put('/:id/client-dispute', protect, authorize('client'), disputeBooking);

module.exports = router;
