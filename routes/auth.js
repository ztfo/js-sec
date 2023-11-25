const express = require('express');
const passport = require('passport');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const path = require('path');
const { body, validationResult } = require('express-validator');

// login
router.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

router.post(
    '/login',
    [
        body('username').isLength({ min: 3 }).trim().escape(),
        body('password').isLength({ min: 5 }).trim().escape(),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
    })
);

// authenticated routes
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// registration
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

router.post('/register', (req, res) => {
    console.log('Received register request');

    const { username, password, isAdmin, isApproved } = req.body;

    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ error: 'Missing username or password' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.log('Error hashing password:', err);
            return res.status(500).json({ error: err });
        }

        console.log('Creating user...');
        User.create({ username, password: hashedPassword, isAdmin, isApproved })
            .then((user) => {
                console.log('User created:', user);
                res.json(user);
            })
            .catch((err) => {
                console.log('Error creating user:', err);
                res.status(400).json('Error: ' + err);
            });
    });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
