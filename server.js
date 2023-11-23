require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const path = require('path');
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended:true }));

// https
const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

// serve
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// post route for login
app.post('/login', [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('password').isLength({ min: 5 }).trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  console.log('Validated Login Attempt:', username, password);
  res.send('Login validated');
});

// start
app.listen(3000, () => {
    console.log('ztfo is running on port 3000')
});