const { body, validationResult } = require('express-validator');
const Comment = require('../models/comment');

// Create a comment (POST)
exports.comment_create_post = [
  // Validation
  body('content', 'Content must be specified.').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Send errors.
      res.json({ errors: errors.array() });
      return;
    }

    // Data form is valid
    // Create the comment with the data
    const comment = new Comment({
      author: req.body.username,
      content: req.body.content,
      timestamp: new Date(),
      post: req.params.postId,
    });

    comment.save((err) => {
      if (err) return next(err);
      res.redirect(`/posts/${req.params.postId}`);
    });
  },
];

// Read all comments from one post
exports.comment_list = function (req, res, next) {
  Comment.find({ post: req.params.postId })
    .sort(['timestamp', 'descending'])
    .exec((err, comments) => {
      if (err) return next(err);
      res.json(comments);
    });
};

// Read a specific post
exports.comment_detail = function (req, res, next) {
  Comment.findById(req.params.commentId).exec((err, comment) => {
    if (err) return next(err);
    res.json(comment);
  });
};

// Update a comment (GET)
exports.comment_update_get = function (req, res, next) {
  Comment.findById(req.params.commentId).exec((err, comment) => {
    if (err) return next(err);
    if (typeof comment === 'undefined') {
      const error = new Error('Comment not found.');
      error.status = 404;
      return next(error);
    }
    res.json(comment);
  });
};

// Update a comment (POST)
exports.comment_update_post = [
  // Validation
  body('content', 'Content must be specified.').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Send them.
      res.json({ errors: errors.array() });
    }

    const comment = new Comment({
      author: req.body.username,
      content: req.body.content,
      timestamp: new Date(),
      post: req.params.postId,
      _id: req.params.commentId,
    });

    // Data is valid, update the comment.
    Comment.findByIdAndUpdate(req.params.commentId, comment, {}, (err) => {
      if (err) return next(err);
      res.redirect(comment.url);
    });
  },
];

// Delete a comment (GET)
exports.comment_delete_get = function (req, res, next) {
  Comment.findById(req.params.commentId).exec((err, comment) => {
    if (err) return next(err);
    if (typeof comment === 'undefined') {
      const error = new Error('Comment not found.');
      error.status = 404;
      return next(error);
    }
    res.json(comment);
  });
};

// Delete a comment (POST)
exports.comment_delete_post = function (req, res, next) {
  Comment.findByIdAndRemove(req.params.commentId, (err) => {
    if (err) return next(err);
    res.redirect(`/posts/${req.params.postId}`);
  });
};
