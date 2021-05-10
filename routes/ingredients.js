const express = require('express');
const passport = require('passport');

const router = express.Router();
const ingredientController = require('../controllers/ingredientController');

// GET categories homepage (all categories)
router.get('/', ingredientController.ingredient_list);

// GET request for a ingredient posts
router.get('/:ingredientId/posts', ingredientController.ingredient_posts);

// POST request to create a new ingredient
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  ingredientController.ingredient_create_post,
);

// PUT request to update a ingredient
router.put(
  '/:ingredientId',
  passport.authenticate('jwt', { session: false }),
  ingredientController.ingredient_update_put,
);

// DELETE request to update a ingredient
router.delete(
  '/:ingredientId',
  passport.authenticate('jwt', { session: false }),
  ingredientController.ingredient_delete,
);

// GET request for a specific ingredient details
router.get('/:ingredientId', ingredientController.ingredient_detail);

module.exports = router;
