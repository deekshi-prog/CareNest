const express = require('express');
const {
  getPlatformMetrics,
  getPendingAssistants,
  verifyAssistant,
  disputeBooking,
  refundBooking,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/metrics', protect, authorize('admin'), getPlatformMetrics);
router.get('/pending-assistants', protect, authorize('admin'), getPendingAssistants);
router.put('/verify/:assistantId', protect, authorize('admin'), verifyAssistant);
router.put('/bookings/:id/dispute', protect, authorize('admin'), disputeBooking);
router.put('/bookings/:id/refund', protect, authorize('admin'), refundBooking);

module.exports = router;
