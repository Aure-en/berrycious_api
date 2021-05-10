const { body, validationResult } = require('express-validator');
const Category = require('../models/category');
const Post = require('../models/post');

// Send list of all categories (GET)
exports.category_list = function (req, res, next) {
  Category.find().sort({ name: 'asc' }).exec((err, categories) => {
    if (err) return next(err);
    return res.json(categories);
  });
};

// Send the category details (GET)
exports.category_detail = function (req, res, next) {
  Category.findById(req.params.categoryId).exec((err, category) => {
    if (err) return next(err);
    if (!category) {
      return res.send('Category not found');
    }
    return res.json(category);
  });
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

// Send all posts in this category (GET)
exports.category_posts = function (req, res, next) {
  const sort = setSort(req.query);
  const { page = 1, limit = 10 } = req.query;
  Post
    .find({ category: req.params.categoryId })
    .collation({ locale: 'en', strength: 2 })
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec((err, posts) => {
      if (err) return next(err);
      res.json(posts);
    });
};

// Create a category (POST)
exports.category_create_post = [
  // Validation
  body('name', 'Genre name required').trim().isLength({ min: 1 }),

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
    const category = new Category({ name: req.body.name });
    category.save((err) => {
      if (err) return next(err);
      return res.redirect(category.url);
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
      _id: req.params.categoryId,
    });

    Category.findByIdAndUpdate(req.params.categoryId, category, {}, (err) => {
      if (err) return next(err);
      res.redirect(category.url);
    });
  },
];

// Delete a category (DELETE)
exports.category_delete = function (req, res, next) {
  Category.findByIdAndDelete(req.params.categoryId).exec((err) => {
    if (err) return next(err);
    res.redirect('/categories');
  });
};
