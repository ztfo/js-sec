const express = require('express');
const router = express.Router();
const { Wager } = require('../models');
const { ensureAuthenticated } = require('./authRoutes'); // Import the middleware

// wager form
router.get('/new', ensureAuthenticated, (req, res) => { // Apply the middleware
    res.render('components/wagerForm');
});

// wager
router.post('/', ensureAuthenticated, async (req, res) => { // Apply the middleware
    try {
        // wager data from the request body
        const { amount, date } = req.body;

        // check if the user is logged in
        if (!req.session || !req.session.passport || !req.session.passport.user || !req.user || !req.user.dataValues || !req.user.dataValues.userId) {
            return res.status(401).json({ error: 'You must be logged in to create a wager.' });
        }

        // user ID
        const userId = req.session.passport.user || req.user.dataValues.userId;

        // new wager in the database
        const newWager = await Wager.create({ amount, date, userId });

        // response with the new wager
        res.json(newWager);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;