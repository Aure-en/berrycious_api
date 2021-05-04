const { body, validationResult } = require('express-validator');
const Post = require('../models/post');

// Create a post (POST)
exports.post_create_post = [
  // Validation
  body('title', 'Title must be specified.').trim().isLength({ min: 1 }),
  body('content', 'Content must be specified.').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Send errors.
      res.json({ errors: errors.array() });
      return;
    }

    // Data form is valid
    // Create the post with the data
    const post = new Post({
      author: '',
      title: req.body.title,
      text: req.body.text,
      images: req.body.images,
      timestamp: new Date(),
      published: req.body.published,
    });

    post.save((err) => {
      if (err) return next(err);
      res.redirect(post.url);
    });
  },
];

// Read all posts
exports.post_list = function (req, res, next) {
  Post.find().sort(['timestamp', 'descending'])
    .populate('author').exec((err, posts) => {
      if (err) return next(err);
      res.json(posts);
    });
};

// Read a specific post
exports.post_detail = function (req, res, next) {
  Post.findById(req.params.postId).populate('author').exec((err, post) => {
    if (err) return next(err);
    if (typeof post === 'undefined') {
      const error = new Error('Post not found.');
      error.status = 404;
      return next(error);
    }
    res.json(post);
  });
};

// Update a post (GET)
exports.post_update_get = function (req, res, next) {
  Post.findById(req.params.postId).populate('author').exec((err, post) => {
    if (err) return next(err);
    if (typeof post === 'undefined') {
      const error = new Error('Post not found.');
      error.status = 404;
      return next(error);
    }
    res.json(post);
  });
};

// Update a post (PUT)
exports.post_update_put = [
  // Validation
  body('title', 'Title must be specified.').trim().isLength({ min: 1 }),
  body('content', 'Content must be specified.').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Send them.
      res.json({ errors: errors.array() });
    }

    const post = new Post({
      author: '',
      title: req.body.title,
      text: req.body.text,
      images: req.body.images,
      timestamp: new Date(),
      published: req.body.published,
      _id: req.params.postId,
    });

    // Data is valid, update the post.
    Post.findByIdAndUpdate(req.params.postId, post, {}, (err) => {
      if (err) return next(err);
      res.redirect(post.url);
    });
  },
];

// Delete a post (GET)
exports.post_delete_get = function (req, res, next) {
  Post.findById(req.params.postId).populate('author').exec((err, post) => {
    if (err) return next(err);
    if (typeof post === 'undefined') {
      const error = new Error('Post not found.');
      error.status = 404;
      return next(error);
    }
    res.json(post);
  });
};

// Delete a post (POST)
exports.post_delete = function (req, res, next) {
  Post.findByIdAndRemove(req.params.postId, (err) => {
    if (err) return next(err);
    res.redirect('/posts');
  });
};
