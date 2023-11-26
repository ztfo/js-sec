const express = require('express');
const passport = require('passport');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { PendingUser } = require('../models');
const jwt = require('jsonwebtoken');
const path = require('path');
const { body, validationResult } = require('express-validator');
const mailer = require('../utils/mailer');

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
            res.status(400).json({ errors: errors.array() });
            return;
        }
        next();
    },
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
        failureFlash: true,
    })
);

// authenticated routes
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// logout
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy(function(err) {
            if (err) {
                console.log('Session destruction error:', err);
                return next(err);
            }
            res.redirect('/');
        });
    });
});

// registration request
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

router.post('/register', [
    body('fullName').isLength({ min: 3 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
], async (req, res) => {
    console.log('Received register request');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { fullName, email } = req.body;

    if (!fullName || !email) {
        console.log('Missing full name or email');
        return res.status(400).json({ error: 'Missing full name or email' });
    }

    try {
        console.log('Creating pending user...');
        const token = jwt.sign({ fullName, email }, process.env.JWT_SECRET, { expiresIn: '15d' });
        await PendingUser.create({ fullName, email, token });
        console.log('Pending user created');

        const msg = {
            to: email,
            from: 'hello@builtwithwords.ai',
            subject: 'Complete your registration',
            text: `You're almost there! Click the link below to complete your registration: http://localhost:3000/confirm?token=${token}`,
        };

        mailer.send(msg).then(() => {
            console.log('Email sent');
        }).catch((error) => {
            console.log('Error sending email:', error);
        });

        res.send('Registration successful, please check your email for confirmation');
    } catch (error) {
        console.log('Error creating pending user:', error);
        res.status(500).send('An error occurred during registration');
    }
});

// registration confirmation
router.get('/confirm', async (req, res) => {
    const { token } = req.query;

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const pendingUser = await PendingUser.findOne({ where: { email: payload.email, token } });

        if (!pendingUser) {
            return res.status(400).send('Invalid confirmation link');
        }

        // Save the pending user's data in the session
        req.session.pendingUser = pendingUser;

        // Send the confirm.html file
        res.sendFile(path.join(__dirname, '../public/confirm.html'));
    } catch (error) {
        console.log('Error confirming user:', error);
        res.status(500).send('An error occurred during confirmation');
    }
});

// post new user
router.post('/confirm', async (req, res) => {

    const { username, email, password } = req.body;
    const pendingUser = req.session.pendingUser;
    
    if (!pendingUser || pendingUser.email !== email) {
        return res.status(400).send('Invalid confirmation data');
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            username,
            email,
            password: hashedPassword,
        });

        await PendingUser.destroy({ where: { email } });

        res.send('Confirmation successful, you can now log in');
    } catch (error) {
        console.log('Error confirming user:', error);
        res.status(500).send('An error occurred during confirmation');
    }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
