const User = require('../models/user');
const Post = require('../models/post');

// Read all users
exports.user_list = function (req, res, next) {
  User.find({}, 'username _id').exec((err, users) => {
    if (err) return next(err);
    res.json(users);
  });
};

// Read a specific user detail
exports.user_detail = function (req, res, next) {
  User.findById(req.params.userId, 'username _id').exec((err, user) => {
    if (err) return next(err);
    if (typeof user === 'undefined') {
      const error = new Error('User not found');
      error.status = 404;
      return next(err);
    }
    res.json(user);
  });
};

// Get all posts from a user
exports.user_posts = function (req, res, next) {
  Post.find({ author: req.params.userId }).exec((err, posts) => {
    if (err) return next(err);
    res.json(posts);
  });
};
