const express = require('express');

const router = express.Router();
const postController = require('../controllers/postController');
const commentRouter = require('./comments');

// GET posts homepage
router.get('/', postController.post_list);

// GET request to update a post
router.get('/:postId/edit', postController.post_update_get);

// PUT request to update a post
router.put('/:postId', postController.post_update_put);

// DELETE request to delete a post
router.delete('/:postId', postController.post_delete);

// GET request for a specific post
router.get('/:postId', postController.post_detail);

// Request for comments
router.use('/:postId/comments', commentRouter);
