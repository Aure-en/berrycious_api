const { body, validationResult } = require('express-validator');
const Message = require('../models/message');

// GET all messages
exports.message_list = function (req, res, next) {
  Message.find().sort({ timestamp: 'desc' }).exec((err, messages) => {
    if (err) return next(err);
    return res.json(messages);
  });
};

// GET a specific message
exports.message_detail = function (req, res, next) {
  Message.findById(req.params.messageId).exec((err, message) => {
    if (err) return next(err);
    if (!message) {
      return res.json({ error: 'Message not found.' });
    }
    return res.json(message);
  });
};

// POST to create a new message
exports.message_create = [
  // Validation
  body('name', 'Name must be specified.').trim().isLength({ min: 1 }),
  body('email', 'Email must be specified.').trim().isLength({ min: 1 }),
  body('message', 'Message must be specified.').trim().isLength({ min: 1 }),

  // Check for errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Send them.
      return res.json({ errors: errors.array() });
    }
    next();
  },

  // There are no errors. Send the message.
  (req, res, next) => {
    const message = new Message({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
      timestamp: new Date(),
    });

    message.save((err, message) => {
      if (err) return next(err);
      return res.json(message);
    });
  },
];

// Delete a message
exports.message_delete = function (req, res, next) {
  Message.findByIdAndRemove(req.params.messageId).exec((err) => {
    if (err) return next(err);
    return res.json({ success: 'Message deleted.' });
  });
};
