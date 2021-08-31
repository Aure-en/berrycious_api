const async = require('async');
const { body, validationResult } = require('express-validator');
const Category = require('../models/category');
const Post = require('../models/post');
const utils = require('../utils/functions');

// Send list of all categories (GET)
exports.category_list = function (req, res, next) {
  Category.find().sort({ name: 'asc' }).exec((err, categories) => {
    if (err) return next(err);
    return res.json(categories);
  });
};

// Send the category details (GET)
exports.category_detail = function (req, res, next) {
  Category.findOne({ name: new RegExp(`^${req.params.categoryName}$`, 'i') })
    .exec((err, category) => {
      if (err) return next(err);
      if (!category) {
        return res.json({ error: 'Category not found.' });
      }
      return res.json(category);
    });
};

// Send all posts in this category (GET)
exports.category_posts = function (req, res, next) {
  const sort = utils.setSort(req.query);
  const { page = 1, limit = 10 } = req.query;
  async.parallel({
    posts(callback) {
      Post
        .find({ category: req.params.categoryId })
        .collation({ locale: 'en', strength: 2 })
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(callback);
    },
    count(callback) {
      Post.countDocuments({ category: req.params.categoryId }).exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    res.set('count', results.count);
    return res.json(results.posts);
  });
};

// Create a category (POST)
exports.category_create_post = [
  // Validation
  body('name', 'Name must be specified.').trim().isLength({ min: 1 }),

  // Check for errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Send errors.
      return res.json({ errors: errors.array() });
    }
    next();
  },

  // Check if the category name is already taken
  (req, res, next) => {
    Category.findOne({ name: req.body.name }).exec((err, category) => {
      if (err) return next(err);
      if (category) {
        return res.json({
          errors: [
            {
              value: '',
              msg: 'This category already exists.',
              param: 'name',
              location: 'body',
            },
          ],
        });
      }
      next();
    });
  },

  // Everything is fine. Save the category.
  (req, res, next) => {
    const category = new Category({ name: req.body.name, description: req.body.description });
    category.save((err, category) => {
      if (err) return next(err);
      return res.json(category);
    });
  },
];

// Update a category (PUT)
exports.category_update_put = [
  // Validation
  body('name', 'Genre name required').trim().isLength({ min: 1 }),

  (req, res, next) => {
    // check for errors
    const errors = validationResult(req);
    // There are errors. Send them.
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    // Data is valid. Update the category.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.categoryId,
    });

    Category.findByIdAndUpdate(req.params.categoryId, category, { new: true }, (err, category) => {
      if (err) return next(err);
      // Use 303 status to redirect to GET.
      // Otherwise, it infinitely makes PUT requests.
      return res.json(category);
    });
  },
];

// Delete a category (DELETE)
exports.category_delete = function (req, res, next) {
  async.parallel([
    // Delete the category from the posts
    function (callback) {
      Post
        .updateMany(
          { category: req.params.categoryId },
          { $pull: { category: req.params.categoryId } },
        )
        .exec(callback);
    },

    // Delete the category itself
    function (callback) {
      Category.findByIdAndDelete(req.params.categoryId).exec(callback);
    },
  ], (err) => {
    if (err) return next(err);
    return res.json({ success: 'Category deleted.' });
  });
};
