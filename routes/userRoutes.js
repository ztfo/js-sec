const express = require('express');
const router = express.Router();
const User = require('../models/user');

// admin
router.post('/approve/:userId', async (req, res) => {
    
    const adminUser = await User.findByPk(req.user.id);
    if (!adminUser.isAdmin) {
        return res.status(403).json({ error: 'There\'s nothing here for you.' });
    }

    const user = await User.findByPk(req.params.userId);
    if (!user) {
        return res.status(404).json({ error: 'Who are you?' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: 'Approved' });
});

module.exports = router;
