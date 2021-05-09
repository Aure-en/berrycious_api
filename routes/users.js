const express = require('express');
const passport = require('passport');

const router = express.Router();
const userController = require('../controllers/userController');

// GET list of users
router.get('/', userController.user_list);

// GET user published posts
router.get('/:userId/posts', userController.user_posts);

// GET user drafts
router.get(
  '/:userId/drafts',
  passport.authenticate('jwt', { session: false }),
  userController.check_draft_permission,
  userController.user_drafts,
);

// GET user detail
router.get('/:userId', userController.user_detail);

module.exports = router;
