const express = require('express');
const router = express.Router();
const client = require('../config/plaidConfig');

router.post('/create_link_token', async (req, res) => {
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

module.exports = router;
