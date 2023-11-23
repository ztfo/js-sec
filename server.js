// modules
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path')
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// express
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// login
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

// https
const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

// https server
https.createServer(httpsOptions, app).listen(3000, () => {
  console.log('running...')
});