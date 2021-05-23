const express = require('express');
const passport = require('passport');
const messageController = require('../controllers/messageController');

const router = express.Router();

// GET all messages
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  messageController.message_list,
);

// GET a specific message
router.get(
  '/:messageId',
  passport.authenticate('jwt', { session: false }),
  messageController.message_detail,
);

// POST request to create a new message
router.post('/', messageController.message_create);

// DELETE a message
router.delete(
  '/:messageId',
  passport.authenticate('jwt', { session: false }),
  messageController.message_delete,
);

module.exports = router;
