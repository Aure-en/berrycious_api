const express = require('express');
const passport = require('passport');

const commentController = require('../controllers/commentController');
const router = express.Router({ mergeParams: true });

// GET comments
router.get('/', commentController.comment_list);

// POST request to create a new comment
router.post('/', commentController.comment_create_post);

// POST request to reply to a comment
router.post('/:commentId', commentController.comment_reply_post);

// GET request to update a comment
router.get('/:commentId/edit', commentController.comment_detail);

// DELETE request to delete a comment
router.delete(
  '/:commentId',
  passport.authenticate('jwt', { session: false }),
  commentController.check_post_author,
  commentController.comment_delete,
);

// GET request for a specific comment
router.get('/:commentId', commentController.comment_detail);

module.exports = router;
