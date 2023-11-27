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
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// login
router.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

router.post('/login',
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
        failureRedirect: '/',
        failureFlash: true,
    }),
    async (req, res) => {
        const user = await User.findOne({ where: { username: req.body.username } });

        if (user && user.mfaSecret) {
            res.redirect('/enter-mfa-token');
        } else {
            res.redirect('/dashboard');
        }
});

// verify mfa token
router.post('/verify-mfa-login', async (req, res) => {
    const { token, username } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
        return res.status(400).send('User not found');
    }

    const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: token
    });

    if (verified) {
        // MFA verification successful, log the user in
        req.login(user, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send('An error occurred during login');
            }

            return res.redirect('/dashboard');
        });
    } else {
        // MFA verification failed
        res.status(400).send('Invalid token');
    }
});

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

        res.send('Registration requested. If approved, you will receive a confirmation email shortly.');
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
        const pendingUser = await PendingUser.findOne({ where: { pendingUserId: payload.id, token } });

        if (!pendingUser) {
            return res.status(400).send('Invalid confirmation link');
        }

        req.session.pendingUser = pendingUser;

        res.sendFile(path.join(__dirname, '../public/confirm.html'));
    } catch (error) {
        console.log('Error confirming user:', error);
        res.status(500).send('An error occurred during confirmation');
    }
});

router.post('/confirm', async (req, res) => {
    try {
        const { email, password } = req.body;
        const pendingUser = await PendingUser.findOne({ where: { email } });

        if (!pendingUser) {
            return res.status(400).send('Invalid confirmation link');
        }

        if (password !== pendingUser.password) {
            return res.status(400).send('Passwords do not match');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username: pendingUser.username,
            email,
            password: hashedPassword,
            isApproved: false, 
            isAdmin: pendingUser.isAdmin
        });

        // secret key
        const secret = speakeasy.generateSecret({length: 20});
        user.mfaSecret = secret.base32;
        await user.save();

        // qr code
        QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
            if (err) {
                console.log('Error generating QR code:', err);
                return res.status(500).send('An error occurred during confirmation');
            }

            // qr code url
            res.json({qrCode: data_url});
        });
    } catch (error) {
        console.log('Error confirming user:', error);
        res.status(500).send('An error occurred during confirmation');
    }
});

// verify mfa
router.post('/verify-mfa', async (req, res) => {
    const { token, email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
        return res.status(400).send('User not found');
    }

    const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: token
    });

    if (verified) {
        
        user.isApproved = true;
        await user.save();

        const pendingUser = await PendingUser.findOne({ where: { email } });
        if (pendingUser) {
            await pendingUser.destroy();
        }

        res.redirect('/login');

    } else {
        res.status(400).send('Invalid token');
    }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
