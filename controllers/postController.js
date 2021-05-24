const async = require('async');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Post = require('../models/post');
const Comment = require('../models/comment');
const utils = require('../utils/functions');

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
      prep_time: req.body.prep_time,
      cook_time: req.body.cook_time,
      serves: req.body.serves,
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

// Read all posts
exports.post_list = function (req, res, next) {
  const filters = utils.setFilters(req.query);
  const sort = utils.setSort(req.query);

  // Set up pagination
  const { page = 1, limit = 10 } = req.query;

  // Search for the actual posts and the number of posts
  async.parallel({
    posts(callback) {
      Post
        .find(filters, 'title description images')
        .collation({ locale: 'en', strength: 2 }) // Ignore sensitivity for alphabetical sort
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(callback);
    },
    count(callback) {
      Post
        .countDocuments(filters)
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    res.set('count', results.count);
    return res.json(results.posts);
  });
};

// Read a specific post
exports.post_detail = function (req, res) {
  Post.findById(req.params.postId)
    .populate('author', 'username _id')
    .exec((err, post) => {
      if (typeof post === 'undefined') {
        return res.json({ error: 'Post not found.' });
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
      prep_time: req.body.prep_time,
      cook_time: req.body.cook_time,
      serves: req.body.serves,
      _id: req.params.postId,
    };

    // Add images if there are any
    if (req.files.length > 0) {
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

    // Data is valid, update the post.
    Post.findByIdAndUpdate(req.params.postId, { $set: data }, {}, (err, post) => {
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

// Wrote this when I was considering allowing several users to post,
// but I decided to make this a 1-person blog only for now.
exports.check_author = function (req, res, next) {
  Post.findById(req.params.postId).exec((err, post) => {
    if (err) return next(err);
    if (typeof post === 'undefined') {
      return res.json({ error: 'Post not found.' });
    }
    if (req.user._id !== post.author.toString()) {
      res.status(403).send('Sorry, only the author may modify the post.');
    } else {
      next();
    }
  });
};
