const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

// POST Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const error = new Error('This user does not exist.');
      error.status = 404;
      return next(err);
    }
    req.login(user, { session: false }, (err) => {
      if (err) res.send(err);
      // Generate a JWT with the contents of user object
      const token = jwt.sign(user, process.env.JWT_SECRET);
      return res.json({ user, token });
    });
  })(req, res);
});

module.exports = router;