const express = require('express');
const router = express.Router();
const User = require('../models/user');
const sgMail = require('../utils/mailer');

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

router.post('/update-budget-timeframe', async (req, res) => {
    const { budget, timeframe } = req.body;
    const userId = req.user.id; // Adjust according to how you handle authentication
  
    try {
      await User.update(
        { budget, timeframe },
        { where: { id: userId } }
      );
      res.redirect('/dashboard'); // Redirect back to the dashboard
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });



module.exports = router;
