const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

// login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
}));

// authenticated routes
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard');
});

// logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login')
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;