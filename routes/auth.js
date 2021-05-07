const express = require('express');
const passport = require('passport');

const router = express.Router();
const authController = require('../controllers/authController');

// POST Login
router.post('/login', authController.auth_login_post);

// POST Signup
router.post('/signup', authController.auth_signup_post);

// Protected route example
router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log(req.user);
  res.send('This is a protected route.');
});

module.exports = router;
