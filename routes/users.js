const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');

// GET list of users
router.get('/', userController.user_list);

// GET user published posts
router.get('/:userId/posts', userController.user_posts);

// GET user drafts
router.get('/:userId/drafts', userController.user_drafts);

// GET user detail
router.get('/:userId', userController.user_detail);

module.exports = router;
