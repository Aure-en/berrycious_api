const express = require('express');
const passport = require('passport');

const router = express.Router();
const postController = require('../controllers/postController');
const commentRouter = require('./comments');
const upload = require('../middleware/upload');

// GET posts homepage
router.get('/', postController.post_list);

// POST request to create a new post
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  upload,
  postController.post_create_post,
);

// PUT request to update a post
router.put(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  upload,
  postController.check_author,
  postController.post_update_put,
);

// PATCH request to add an image from a post
router.patch(
  '/:postId/images',
  passport.authenticate('jwt', { session: false }),
  upload,
  postController.check_author,
  postController.post_add_images,
);

// PATCH request to remove an image from a post
router.patch(
  '/:postId/images/:imageId',
  passport.authenticate('jwt', { session: false }),
  postController.check_author,
  postController.post_remove_image,
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
