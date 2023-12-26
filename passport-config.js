const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./models');
const bcryptjs = require('bcryptjs');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy(function (username, password, done) {
      User.findOne({ where: { username: username } })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
          }
          if (!user.isApproved) {
            return done(null, false, { message: 'You\'re not in yet.' });
          }
          bcryptjs.compare(password, user.password, (err, isMatch) => {
            if (err) {
              return done(err);
            }
            if (!isMatch) {
              return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
          });
        })
        .catch((err) => {
          console.error(err);
          return done(err);
        });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.userId);
  });

  passport.deserializeUser(function (userId, done) {
    User.findByPk(userId)
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });
};