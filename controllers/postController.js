const async = require('async');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Post = require('../models/post');
const Comment = require('../models/comment');

// Create a post (POST)
exports.post_create_post = [
  // Validation
  body('title', 'Title must be specified.').trim().isLength({ min: 1 }),
  body('text', 'Text must be specified.').trim().isLength({ min: 1 }),
  body('published', 'Post must be private or public').isBoolean(),
  body('ingredient.*'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Send errors.
      return res.json({ errors: errors.array() });
    }

    // Data form is valid
    // Create the post with the data

    // Convert ingredient and category to arrays if they aren't array
    if (req.body.ingredient && !(req.body.ingredient instanceof Array)) {
      req.body.ingredient = new Array(req.body.ingredient);
    }

    if (req.body.category && !(req.body.category instanceof Array)) {
      req.body.category = new Array(req.body.category);
    }

    const data = {
      author: req.user._id,
      title: req.body.title,
      description: req.body.description,
      text: req.body.text,
      timestamp: new Date(),
      published: req.body.published,
      ingredient: req.body.ingredient,
      category: req.body.category,
    };

    // Add images if there are any
    if (req.files) {
      const images = [];
      req.files.map((image) => {
        // Push the image in images
        images.push({
          name: image.filename,
          data: fs.readFileSync(path.join(__dirname, `../images/${image.filename}`)),
          contentType: image.mimetype,
        });

        // Delete the image from the disk after using it
        fs.unlink(path.join(__dirname, `../images/${image.filename}`), (err) => {
          if (err) throw err;
        });
      });
      data.images = images;
    }

    const post = new Post(data);

    post.save((err) => {
      if (err) return next(err);
      res.redirect(post.url);
    });
  },
];

// Helper functions to filter / sort through the list of posts.
const setFilters = (queries) => {
  const filters = { published: true };
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
exports.post_detail = function (req, res) {
  Post.findById(req.params.postId)
    .populate('author', 'username _id')
    .exec((err, post) => {
      if (typeof post === 'undefined') {
        return res.send('Post not found.');
      }
      return res.json(post);
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
      return res.json({ errors: errors.array() });
    }

    const data = {
      author: req.user._id,
      title: req.body.title,
      description: req.body.description,
      text: req.body.text,
      timestamp: new Date(),
      published: req.body.published,
      ingredient: req.body.ingredient,
      category: req.body.category,
      _id: req.params.postId,
    };

    // Add images if there are any
    if (req.files) {
      const images = [];
      req.files.map((image) => {
        // Push the image in images
        images.push({
          name: image.filename,
          data: fs.readFileSync(path.join(__dirname, `../images/${image.filename}`)),
          contentType: image.mimetype,
        });

        // Delete the image from the disk after using it
        fs.unlink(path.join(__dirname, `../images/${image.filename}`), (err) => {
          if (err) throw err;
        });
      });
      data.images = images;
    }

    const post = new Post(data);

    // Data is valid, update the post.
    Post.findByIdAndUpdate(req.params.postId, post, {}, (err) => {
      if (err) return next(err);
      // Use 303 status to redirect to GET.
      // Otherwise, it infinitely makes PUT requests.
      return res.redirect(303, post.url);
    });
  },
];

// Delete a post (POST)
exports.post_delete = function (req, res, next) {
  async.parallel(
    [
      function (callback) {
        Post.findByIdAndRemove(req.params.postId).exec(callback);
      },
      function (callback) {
        Comment.deleteMany({ post: req.params.postId }).exec(callback);
      },
    ],
    (err) => {
      if (err) return next(err);
      res.redirect(303, '/posts');
    },
  );
};

exports.check_author = function (req, res, next) {
  Post.findById(req.params.postId).exec((err, post) => {
    if (err) return next(err);
    if (typeof post === 'undefined') {
      return res.send('Post not found.');
    }
    if (req.user._id !== post.author.toString()) {
      res.status(403).send('Sorry, only the author may modify the post.');
    } else {
      next();
    }
  });
};
