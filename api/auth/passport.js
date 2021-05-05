const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          return done(null, user, { message: 'Logged in successfully.' });
        }
        return done(null, false, { message: 'Incorrect password.' });
      });
    });
  }),
);

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}, ((jwtPayload, done) => {
  if (jwtPayload) {
    return done(null, jwtPayload);
  }
  return done(null, false);
})));
