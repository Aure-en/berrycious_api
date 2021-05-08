const async = require('async');
const { body, validationResult } = require('express-validator');
const Post = require('../models/post');
const Comment = require('../models/comment');

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
      ingredient: req.body.ingredient,
      category: req.body.category,
    });

    post.save((err) => {
      if (err) return next(err);
      res.redirect(post.url);
    });
  },
];

// Helper functions to filter / sort through the list of posts.
const setFilters = (queries) => {
  const filters = {};
  const {
    category, ingredient, author, search,
  } = queries;
  if (category) filters.category = queries.category;
  if (ingredient) filters.ingredient = queries.ingredient;
  if (author) filters.author = queries.author;
  if (search) {
    filters.$or = [
      { title: { $regex: queries.search, $options: 'i' } },
      { text: { $regex: queries.search, $options: 'i' } },
    ];
  }
  return filters;
};

const setSort = (queries) => {
  const { sort_by, order = 'desc' } = queries;
  let sort;
  switch (sort_by) {
    case 'date':
      sort = { timestamp: order };
      break;
    case 'alphabetical':
      sort = { title: order };
      break;
    case 'popularity':
      sort = { likes: order };
      break;
    default:
      sort = { timestamp: order };
  }
  return sort;
};

// Read all posts
exports.post_list = function (req, res, next) {
  const filters = setFilters(req.query);
  const sort = setSort(req.query);

  // Set up pagination
  const { page = 1, limit = 10 } = req.query;

  // Search for the actual posts
  Post
    .find(filters)
    .collation({ locale: 'en', strength: 2 }) // Ignore sensitivity for alphabetical sort
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec((err, posts) => {
      if (err) return next(err);
      if (!posts) {
        const error = new Error('There are no posts here.');
        error.status = 404;
        return next(err);
      }
      res.json(posts);
    });
};

// Read a specific post
exports.post_detail = function (req, res, next) {
  Post.findById(req.params.postId)
    .populate('author')
    .exec((err, post) => {
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
      return;
    }

    const post = new Post({
      author: req.user._id,
      title: req.body.title,
      text: req.body.text,
      images: req.body.images,
      timestamp: new Date(),
      published: req.body.published,
      ingredient: req.body.ingredient,
      category: req.body.category,
      _id: req.params.postId,
    });

    // Data is valid, update the post.
    Post.findByIdAndUpdate(req.params.postId, post, {}, (err) => {
      if (err) return next(err);
      res.redirect(post.url);
    });
  },
];

// Delete a post (POST)
exports.post_delete = function (req, res, next) {
  async.parallel(
    [
      function (callback) {
        Post.findByIdAndRemove(req.params.postId, (err) => {
          if (err) return next(err);
          callback();
        });
      },
      function (callback) {
        Comment.deleteMany({ post: req.params.postId }, (err) => {
          if (err) return next(err);
          callback();
        });
      },
    ],
    (err) => {
      if (err) return next(err);
      res.redirect('/posts');
    },
  );
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
      res.status(403).send('Sorry, only the author may modify the post.');
    } else {
      next();
    }
  });
};
