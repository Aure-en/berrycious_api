const { body, validationResult } = require('express-validator');
const Post = require('../models/post');

// Create a post (POST)
exports.post_create_post = [
  // Validation
  body('title', 'Title must be specified.').trim().isLength({ min: 1 }),
  body('text', 'Text must be specified.').trim().isLength({ min: 1 }),

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
      author: req.user._id,
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
  console.log(req.params.postId);
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
  body('text', 'Text must be specified.').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Send them.
      res.json({ errors: errors.array() });
    }

    const post = new Post({
      author: req.user._id,
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
      console.log('post', post);
      res.redirect(post.url);
    });
  },
];

// Delete a post (POST)
exports.post_delete = function (req, res, next) {
  Post.findByIdAndRemove(req.params.postId, (err) => {
    if (err) return next(err);
    res.redirect('/posts');
  });
};

exports.check_author = function (req, res, next) {
  Post.findById(req.params.postId).exec((err, post) => {
    if (err) return next(err);
    if (typeof post === 'undefined') {
      const error = new Error('Post not found.');
      error.status = 404;
      return next(error);
    }
    if (req.user._id !== post.author.toString()) {
      console.log('Not the author');
      res.status(403).send('Sorry, only the author may modify the post.');
    } else {
      console.log('Author is allowed.');
      next();
    }
  });
};
