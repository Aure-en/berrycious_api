const async = require('async');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/comment');
const Post = require('../models/post');

// Create a comment (POST)
exports.comment_create_post = [
  // Validation
  body('username', 'Username must be specified.').trim().isLength({ min: 1 }),
  body('content', 'Content must be specified.').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Send errors.
      res.json({ errors: errors.array() });
      return;
    }

    // Data form is valid
    // Create the comment with the data
    const comment = new Comment({
      username: req.body.username,
      content: req.body.content,
      timestamp: new Date(),
      post: req.params.postId,
      account: req.user && req.user._id,
    });

    comment.save((err) => {
      if (err) return next(err);
      res.redirect(comment.url);
    });
  },
];

// Reply to a comment (POST)
exports.comment_reply_post = [
  // Validation
  body('username', 'Username must be specified.').trim().isLength({ min: 1 }),
  body('content', 'Content must be specified.').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Send errors.
      res.json({ errors: errors.array() });
      return;
    }

    // Data form is valid
    // Create the new comment with the data
    const comment = new Comment({
      username: req.body.username,
      content: req.body.content,
      timestamp: new Date(),
      post: req.params.postId,
      parent: req.params.commentId,
    });

    async.parallel(
      [
        // Save the new comment
        function (callback) {
          comment.save((err) => {
            if (err) return next(err);
            callback();
          });
        },
        function (callback) {
          // Update the parent comment's children
          Comment.findByIdAndUpdate(
            req.params.commentId,
            { $push: { children: comment._id } },
            {},
            (err) => {
              if (err) return next(err);
              callback();
            },
          );
        },
      ],
      (err) => {
        if (err) return next(err);
        res.redirect(`/posts/${req.params.postId}/comments`);
      },
    );
  },
];

// Helper function to sort through list of comments.
const setSort = (queries) => {
  const { sort_by, order = 'desc' } = queries;
  let sort;
  switch (sort_by) {
    case 'date':
      sort = { timestamp: order };
      break;
    case 'popularity':
      sort = { likes: order };
      break;
    default:
      sort = { timestamp: order };
  }
  return sort;
};

// Read all comments from one post (GET)
exports.comment_list = function (req, res, next) {
  const sort = setSort(req.query);
  const { page = 1, limit = 20 } = req.query;

  Comment.find({ post: req.params.postId })
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec((err, comments) => {
      if (err) return next(err);
      res.json(comments);
    });
};

// Read a specific post (GET)
exports.comment_detail = function (req, res, next) {
  Comment.findById(req.params.commentId).exec((err, comment) => {
    if (err) return next(err);
    if (typeof comment === 'undefined') {
      const error = new Error('Comment not found.');
      error.status = 404;
      return next(error);
    }
    res.json(comment);
  });
};

// Update a comment (PUT)
// Not used right now, as no account is required to comment - so no edit is allowed.
exports.comment_update_put = [
  // Validation
  body('username', 'Username must be specified.').trim().isLength({ min: 1 }),
  body('content', 'Content must be specified.').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Send them.
      return res.json({ errors: errors.array() });
    }

    const comment = new Comment({
      username: req.body.username,
      content: req.body.content,
      timestamp: new Date(),
      post: req.params.postId,
      _id: req.params.commentId,
    });

    // Data is valid, update the comment.
    Comment.findByIdAndUpdate(req.params.commentId, comment, {}, (err) => {
      if (err) return next(err);
      // Use 303 status to redirect to GET...
      // Otherwise, it infinitely makes PUT requests.
      return res.redirect(303, comment.url);
    });
  },
];

/* Delete a comment (DELETE)
- If the comment has children, change the text and author to [removed]
- If the comment does not have children, remove the comment.
*/
exports.comment_delete = function (req, res, next) {
  async.waterfall([
    // Get the comment and send its children field
    function (callback) {
      Comment.findById(req.params.commentId).exec((err, comment) => {
        if (err) return next(err);
        if (!comment) {
          const error = new Error('Comment not found.');
          error.status = 404;
          return next(error);
        }
        callback(null, comment.children);
      });
    },
    function (children) {
      // If the comment has no children, simply delete it.
      if (children.length === 0) {
        Comment.findByIdAndRemove(req.params.commentId, (err) => {
          if (err) return next(err);
          res.redirect(`/posts/${req.params.postId}/comments`);
        });
      } else {
        // If the comment had children, keep the document but
        // erase the text and author.
        Comment.findByIdAndUpdate(req.params.commentId, {
          username: '[removed]', content: '[removed]', account: undefined, deleted: true,
        },
        (err) => {
          if (err) return next(err);
          res.redirect(`/posts/${req.params.postId}/comments`);
        });
      }
    },
  ]);
};

/* Delete Permission. If the comment was posted:
  - Anonymously: in that case, only the post author may delete it.
  - By a registered user: comment author & post author may delete it.
*/
exports.check_delete_permission = function (req, res, next) {
  async.waterfall(
    [
      // Get post author
      function (callback) {
        Post.findById(req.params.postId).exec((err, post) => {
          if (err) return next(err);
          if (typeof post === 'undefined') {
            const error = new Error('Post not found.');
            error.status = 404;
            return next(error);
          }
          callback(null, post.author);
        });
      },
      function (author) {
        Comment.findById(req.params.commentId).exec((err, comment) => {
          if (err) return next(err);
          if (typeof comment === 'undefined') {
            const error = new Error('Comment not found');
            error.status = 404;
            return next(error);
          }

          // If comment was written by an anonymous user,
          // Only the post author may delete it.
          if (!comment.account) {
            if (req.user._id !== author.toString()) {
              res
                .status(403)
                .send('Sorry, only the post author may delete the comment.');
            } else {
              next();
            }
          } else if (
            req.user._id !== author.toString()
            && req.user._id !== comment.account.toString()
          ) {
            res
              .status(403)
              .send(
                'Sorry, only the comment and post authors may modify the comment.',
              );
          } else {
            next();
          }
        });
      },
    ],
  );
};

/* Update Permission:
  - Comments can only be modified by their author if they were logged in.
*/
exports.check_update_permission = function (req, res, next) {
  Comment.findById(req.params.commentId, (err, comment) => {
    if (err) return next(err);
    if (typeof comment === 'undefined') {
      const error = new Error('Comment not found.');
      error.status = 404;
      return next(error);
    }
    if (!comment.account) {
      res.status(403).send('Sorry, anonymously written comments cannot be modified.');
    } else if (req.user._id !== comment.account.toString()) {
      res.status(403).send('Sorry, only the author may edit the comment.');
    } else {
      next();
    }
  });
};
