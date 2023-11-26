const express = require('express');
const router = express.Router();
const { PendingUser, User } = require('../models');
const jwt = require('jsonwebtoken');
const mailer = require('../utils/mailer');

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    res.redirect('/login');
}

router.get('/pendingUsers', isAdmin, async (req, res) => {
    const pendingUsers = await PendingUser.findAll();
    res.render('pendingUsers', { pendingUsers });
});

router.post('/approveUser/:id', isAdmin, async (req, res) => {
    const user = await PendingUser.findByPk(req.params.id);
    if (user) {
        user.isApproved = true;
        user.isAdmin = req.body.isAdmin === 'on';
        user.token = jwt.sign({ id: user.pendingUserId }, process.env.JWT_SECRET, { expiresIn: '1d' });
        await user.save();

        // Send confirmation email to the user
        const msg = {
            to: user.email,
            from: 'hello@builtwithwords.ai',
            subject: 'Registration Approved',
            text: `Your registration has been approved. Please complete your registration by clicking the following link: http://localhost:3000/confirm?token=${user.token}`,
        };

        mailer.send(msg).then(() => {
            console.log('Email sent');
        }).catch((error) => {
            console.log('Error sending email:', error);
        });
    }
    res.redirect('/admin/pendingUsers');
});

router.post('/rejectUser/:id', isAdmin, async (req, res) => {
    const user = await PendingUser.findByPk(req.params.id);
    if (user) {
        await user.destroy();
    }
    res.redirect('/admin/pendingUsers');
});

module.exports = router;