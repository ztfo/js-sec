const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});

// login
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
);

// authenticated routes
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard');
});

// logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

// registration
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    User.create({ username, password: hashedPassword })
      .then((user) => res.json(user))
      .catch((err) => res.status(400).json('Error: ' + err));
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
