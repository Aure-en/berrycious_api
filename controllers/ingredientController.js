const async = require('async');
const { body, validationResult } = require('express-validator');
const Ingredient = require('../models/ingredient');
const Post = require('../models/post');
const utils = require('../utils/functions');

// Send list of all ingredients (GET)
exports.ingredient_list = function (req, res, next) {
  Ingredient.find()
    .sort({ name: 'asc' })
    .exec((err, ingredients) => {
      if (err) return next(err);
      return res.json(ingredients);
    });
};

// Send the ingredient details (GET)
exports.ingredient_detail = function (req, res, next) {
  Ingredient.findOne({
    name: new RegExp(`^${req.params.ingredientName}$`, 'i'),
  }).exec((err, ingredient) => {
    if (err) return next(err);
    if (!ingredient) {
      return res.send('Ingredient not found.');
    }
    return res.json(ingredient);
  });
};

// Send all posts in this ingredient (GET)
exports.ingredient_posts = function (req, res, next) {
  const sort = utils.setSort(req.query);
  const { page = 1, limit = 10 } = req.query;
  async.parallel(
    {
      posts(callback) {
        Post.find({ ingredient: req.params.ingredientId })
          .populate('images', 'name thumbnail')
          .collation({ locale: 'en', strength: 2 })
          .sort(sort)
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .exec(callback);
      },
      count(callback) {
        Post.countDocuments({ ingredient: req.params.ingredientId }).exec(
          callback,
        );
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.set('count', results.count);
      return res.json(results.posts);
    },
  );
};

// Create a ingredient (POST)
exports.ingredient_create_post = [
  // Validation
  body('name', 'Ingredient name required').trim().isLength({ min: 1 }),

  // Check for errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Send errors.
      return res.json({ errors: errors.array() });
    }
    next();
  },

  // Check if the ingredient name is already taken
  (req, res, next) => {
    Ingredient.findOne({ name: new RegExp(`^${req.params.name}$`, 'i') }).exec(
      (err, ingredient) => {
        if (err) return next(err);
        if (ingredient) {
          return res.json({
            errors: [
              {
                value: '',
                msg: 'This ingredient already exists.',
                param: 'name',
                location: 'body',
              },
            ],
          });
        }
        next();
      },
    );
  },

  // Everything is fine. Save the ingredient.
  (req, res, next) => {
    const ingredient = new Ingredient({ name: req.body.name });
    ingredient.save((err, ingredient) => {
      if (err) return next(err);
      return res.json(ingredient);
    });
  },
];

// Update a ingredient (PUT)
exports.ingredient_update_put = [
  // Validation
  body('name', 'Ingredient name required').trim().isLength({ min: 1 }),

  (req, res, next) => {
    // check for errors
    const errors = validationResult(req);
    // There are errors. Send them.
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    // Data is valid. Update the ingredient.
    const ingredient = new Ingredient({
      name: req.body.name,
      _id: req.params.ingredientId,
    });

    Ingredient.findByIdAndUpdate(req.params.ingredientId, ingredient, {
      new: true,
    }).exec((err, ingredient) => {
      if (err) return next(err);
      // Use 303 status to redirect to GET...
      // Otherwise, it infinitely makes PUT requests.
      return res.json(ingredient);
    });
  },
];

// Delete a ingredient (DELETE)
exports.ingredient_delete = function (req, res, next) {
  async.parallel(
    [
      // Delete the ingredient from the posts
      function (callback) {
        Post.updateMany(
          { ingredient: req.params.ingredientId },
          { $pull: { ingredient: req.params.ingredientId } },
        ).exec(callback);
      },

      // Delete the ingredient itself
      function (callback) {
        Ingredient.findByIdAndDelete(req.params.ingredientId).exec(callback);
      },
    ],
    (err) => {
      if (err) return next(err);
      return res.json({ success: 'Ingredient deleted.' });
    },
  );
};
