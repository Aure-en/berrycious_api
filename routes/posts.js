const express = require('express');
const passport = require('passport');

const router = express.Router();
const postController = require('../controllers/postController');
const commentRouter = require('./comments');

// GET posts homepage
router.get('/', postController.post_list);

// POST request to create a new post
router.post('/', passport.authenticate('jwt', { session: false }), postController.post_create_post);

// GET request to update a post
router.get('/:postId/edit', passport.authenticate('jwt', { session: false }), postController.post_detail);

// PUT request to update a post
router.put(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  postController.check_author,
  postController.post_update_put,
);

// DELETE request to delete a post
router.delete(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  postController.check_author,
  postController.post_delete,
);

// GET request for a specific post
router.get('/:postId', postController.post_detail);

// Request for comments
router.use('/:postId/comments', commentRouter);

module.exports = router;