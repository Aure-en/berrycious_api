const express = require('express');
const commentController = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

// GET comments
router.get('/', commentController.comment_list);

// GET request to update a comment
router.get('/:commentId/edit', commentController.comment_update_get);

// PUT request to update a comment
router.put(':/commentId', commentController.comment_update_put);

// DELETE request to delete a comment
router.delete(':/commentId', commentController.comment_delete);

// GET request for a specific comment
router.get(':/commentId', commentController.comment_detail);

module.exports = router;