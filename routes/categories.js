const express = require('express');
const passport = require('passport');

const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET categories homepage (all categories)
router.get('/', categoryController.category_list);

// GET request for a category posts
router.get('/:categoryId/posts', categoryController.category_posts);

// POST request to create a new category
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  categoryController.category_create_post,
);

// PUT request to update a category
router.put(
  '/:categoryId',
  passport.authenticate('jwt', { session: false }),
  categoryController.category_update_put,
);

// DELETE request to update a category
router.delete(
  '/:categoryId',
  passport.authenticate('jwt', { session: false }),
  categoryController.category_delete,
);

// GET request for a specific category details
router.get('/:categoryId', categoryController.category_detail);

module.exports = router;
