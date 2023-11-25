// passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const bcrypt = require('bcrypt');

passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ where: { username: username } })
      .then((user) => {
        console.log(user);
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.isApproved) {
          return done(null, false, { message: 'You\'re not in yet.' });
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
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
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findByPk(id)
    .then((user) => done(null, user))
    .catch((err) => done(err));
});
