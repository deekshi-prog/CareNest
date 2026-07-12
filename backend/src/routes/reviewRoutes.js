const express = require('express');
const { createReview, getAssistantReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('client'), createReview);
router.get('/assistant/:assistantId', getAssistantReviews);

module.exports = router;
