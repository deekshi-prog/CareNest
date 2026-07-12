const express = require('express');
const {
  searchAssistants,
  getAssistantById,
} = require('../controllers/assistantController');
const { optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalProtect, searchAssistants);
router.get('/:userId', optionalProtect, getAssistantById);

module.exports = router;
