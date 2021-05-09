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
  Post.find({ author: req.params.userId, published: true }).exec((err, posts) => {
    if (typeof posts === 'undefined') {
      res.send('This user has no posts.');
    }
    if (err) return next(err);
    return res.json(posts);
  });
};

// Get a user drafts
exports.user_drafts = function (req, res, next) {
  Post.find({ author: req.params.userId, published: false }).exec((err, posts) => {
    if (err) return next(err);
    if (typeof posts === 'undefined') {
      res.send('There are no drafts here.');
    }
    return res.json(posts);
  });
};
