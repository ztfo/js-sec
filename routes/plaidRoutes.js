const express = require('express');
const router = express.Router();
const client = require('../config/plaidConfig');

// 
router.post('/link_bank_account', async (req, res) => {
  try {
    const response = await client.createLinkToken({
      user: {
        client_user_id: 'unique_user_id', // todo: replace with unique user id
      },
      client_name: 'Wager',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.get('/transactions', async (req, res) => {
    // Assuming access_token is securely retrieved from your database
    const access_token = 'user_specific_access_token';
    try {
      const response = await client.getTransactions(access_token, 'start_date', 'end_date', {
        count: 250, 
        offset: 0,
      });
      // filter transactions
      const gamblingTransactions = response.transactions.filter(/* todo: research filter logic */);
      res.json(gamblingTransactions);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });

module.exports = router;
